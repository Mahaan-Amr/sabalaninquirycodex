"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createUserSession, destroyUserSession } from "@/lib/auth";

type ActionState = {
  ok?: boolean;
  message?: string;
};

export async function userLoginAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { ok: false, message: "نام کاربری و رمز عبور الزامی است." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { ok: false, message: "نام کاربری یا رمز عبور درست نیست." };
  }

  await createUserSession({ userId: user.id, username: user.username });
  redirect("/");
}

export async function userLogoutAction() {
  await destroyUserSession();
  redirect("/");
}
