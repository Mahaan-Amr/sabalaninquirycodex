import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

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

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
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

export async function createUserSession(payload: UserSessionPayload) {
  const token = await new SignJWT(payload)
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

  try {
    const verified = await jwtVerify(token, getSecret());
    const payload = verified.payload as Partial<SessionPayload>;
    if (!payload.adminId || !payload.email) {
      return null;
    }

    return {
      adminId: payload.adminId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function readUserSessionFromToken(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getSecret());
    const payload = verified.payload as Partial<UserSessionPayload>;
    if (!payload.userId || !payload.username) {
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  return readSessionFromToken(cookieStore.get(sessionCookieName)?.value);
}

export async function getUserSession() {
  const cookieStore = await cookies();
  return readUserSessionFromToken(cookieStore.get(userSessionCookieName)?.value);
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
