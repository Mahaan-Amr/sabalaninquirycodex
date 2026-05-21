"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { createUserSchema, productSchema, updateUserSchema } from "@/lib/validation";

type ActionState = {
  ok?: boolean;
  message?: string;
};

export async function loginAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "ایمیل و رمز عبور را وارد کنید." };
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return { ok: false, message: "اطلاعات ورود درست نیست." };
  }

  await createSession({ adminId: admin.id, email: admin.email });
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/products/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  await prisma.product.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(
      `/admin/products/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  await prisma.product.update({ where: { id }, data: parsed.data });
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (id) {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin");
  }
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/admin/users/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        username: parsed.data.username,
        passwordHash,
      },
    });
  } catch {
    redirect(`/admin/users/new?error=${encodeURIComponent("این نام کاربری قبلا ثبت شده است.")}`);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUserAction(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = updateUserSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(
      `/admin/users/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  const data: { username: string; passwordHash?: string } = {
    username: parsed.data.username,
  };

  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  try {
    await prisma.user.update({ where: { id }, data });
  } catch {
    redirect(
      `/admin/users/${id}/edit?error=${encodeURIComponent("این نام کاربری قبلا ثبت شده است.")}`,
    );
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (id) {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
  }
}

export async function importCsvAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "لطفا فایل CSV را انتخاب کنید." };
  }

  const content = await file.text();
  let rows: Record<string, string>[];

  try {
    rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } catch {
    return { ok: false, message: "ساختار فایل CSV معتبر نیست." };
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const parsed = productSchema.safeParse({
      name: row.name,
      description: row.description,
      listPrice: row.listPrice,
      finalPrice: row.finalPrice,
    });

    if (!parsed.success) {
      skipped += 1;
      continue;
    }

    const id = row.id?.trim();

    if (id) {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (existing) {
        await prisma.product.update({ where: { id }, data: parsed.data });
        updated += 1;
        continue;
      }
    }

    await prisma.product.create({ data: parsed.data });
    created += 1;
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return {
    ok: true,
    message: `${created.toLocaleString("fa-IR")} محصول ایجاد شد، ${updated.toLocaleString("fa-IR")} محصول بروزرسانی شد، ${skipped.toLocaleString("fa-IR")} ردیف رد شد.`,
  };
}

export async function exportProductsCsv() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });

  return stringify(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      listPrice: product.listPrice,
      finalPrice: product.finalPrice,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    })),
    { header: true },
  );
}
