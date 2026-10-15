import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import { createHmac, timingSafeEqual } from "node:crypto";

export const sessionCookieName = "sabalan_admin_session";
export const userSessionCookieName = "sabalan_user_session";

type SessionPayload = {
  adminId: string;
  email: string;
};

type UserSessionPayload = {
  userId: string;
  username: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set.");
  }

  return new TextEncoder().encode(secret);
}

async function verifiedSessionClaims(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"], requiredClaims: ["iat", "exp"] });
  if (!Number.isSafeInteger(payload.iat) || !Number.isSafeInteger(payload.exp)
    || payload.iat! > Math.floor(Date.now() / 1000) || payload.exp! <= payload.iat!
    || payload.exp! - payload.iat! > 7 * 86400) throw new Error("INQUIRY_SESSION_INVALID");
  return payload;
}

type Credential = { id: string; passwordHash: string; updatedAt: Date };
function credentialVersion(role: "admin" | "user", account: Credential) {
  return createHmac("sha256", getSecret()).update(JSON.stringify([
    "sabalan-inquiry-session/v1", role, account.id, account.passwordHash, account.updatedAt.toISOString(),
  ])).digest("hex");
}

export async function createSession(payload: SessionPayload, verifiedPasswordHash: string) {
  const account = await prisma.admin.findUnique({ where: { id: payload.adminId } });
  if (!account || account.email !== payload.email || account.passwordHash !== verifiedPasswordHash) {
    throw new Error("INQUIRY_CREDENTIAL_CHANGED");
  }
  const token = await new SignJWT({ ...payload, credentialVersion: credentialVersion("admin", account) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function createUserSession(payload: UserSessionPayload, verifiedPasswordHash: string) {
  const account = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!account || account.username !== payload.username || account.passwordHash !== verifiedPasswordHash) {
    throw new Error("INQUIRY_CREDENTIAL_CHANGED");
  }
  const token = await new SignJWT({ ...payload, credentialVersion: credentialVersion("user", account) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(userSessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function destroyUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(userSessionCookieName);
}

export async function readSessionFromToken(token?: string) {
  if (!token) {
    return null;
  }

  let payload: Awaited<ReturnType<typeof verifiedSessionClaims>>;
  try {
    payload = await verifiedSessionClaims(token);
    if (typeof payload.adminId !== "string" || !payload.adminId || payload.adminId.length > 128
      || typeof payload.email !== "string" || !payload.email || payload.email.length > 320
      || payload.userId !== undefined || payload.username !== undefined) {
      return null;
    }
  } catch {
    return null;
  }
  const account = await prisma.admin.findUnique({ where: { id: payload.adminId as string } });
  if (!account || account.email !== payload.email || !credentialIsCurrent(payload, "admin", account)) return null;
  return { adminId: account.id, email: account.email };
}

export async function readUserSessionFromToken(token?: string) {
  if (!token) {
    return null;
  }

  let payload: Awaited<ReturnType<typeof verifiedSessionClaims>>;
  try {
    payload = await verifiedSessionClaims(token);
    if (typeof payload.userId !== "string" || !payload.userId || payload.userId.length > 128
      || typeof payload.username !== "string" || !payload.username || payload.username.length > 256
      || payload.adminId !== undefined || payload.email !== undefined) {
      return null;
    }
  } catch {
    return null;
  }
  const account = await prisma.user.findUnique({ where: { id: payload.userId as string } });
  if (!account || account.username !== payload.username || !credentialIsCurrent(payload, "user", account)) return null;
  return { userId: account.id, username: account.username };
}

export async function getSession() {
  const cookieStore = await cookies();
  return readSessionFromToken(cookieStore.get(sessionCookieName)?.value);
}

export async function getUserSession() {
  const cookieStore = await cookies();
  return readUserSessionFromToken(cookieStore.get(userSessionCookieName)?.value);
}

function credentialIsCurrent(payload: Awaited<ReturnType<typeof verifiedSessionClaims>>, role: "admin" | "user", account: Credential) {
  if (payload.credentialVersion !== undefined) {
    return typeof payload.credentialVersion === "string" && /^[a-f0-9]{64}$/.test(payload.credentialVersion)
      && timingSafeEqual(Buffer.from(payload.credentialVersion, "hex"), Buffer.from(credentialVersion(role, account), "hex"));
  }
  // Legacy tokens have second precision and no credential binding. Equality
  // cannot distinguish a token minted before the credential changed.
  return typeof payload.iat === "number" && Number.isSafeInteger(payload.iat)
    && payload.iat * 1000 > account.updatedAt.getTime();
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireInquiryUser() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  return session;
}
