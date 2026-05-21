"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import {
  createUserSchema,
  productSchema,
  updateUserSchema,
} from "@/lib/validation";

type ActionState = {
  ok?: boolean;
  message?: string;
};

type RawImportRow = {
  rowNumber: string;
  name: string;
  description: string;
  listPrice: string;
  finalPrice: string;
  discountAvailability: string;
  lastDiscountPercent: string;
  sourceRow: number;
};

const csvHeaders = [
  "rowNumber",
  "name",
  "description",
  "listPrice",
  "finalPrice",
  "discountAvailability",
  "lastDiscountPercent",
];

const excelHeaders = [
  "ردیف",
  "نام کالا",
  "توضیحات",
  "قیمت اعلامی",
  "قیمت کف",
  "امکان تخفیف",
  "اخرین درصد تخفیف",
];

function formatCount(value: number) {
  return value.toLocaleString("fa-IR");
}

function cellToString(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function getImportMessage(created: number, updated: number, skipped: number, errors: string[]) {
  const summary = `${formatCount(created)} محصول ایجاد شد، ${formatCount(updated)} محصول بروزرسانی شد، ${formatCount(skipped)} ردیف رد شد.`;
  if (!errors.length) {
    return summary;
  }

  return `${summary}\nجزئیات ردیف‌های رد شده:\n${errors.slice(0, 10).join("\n")}`;
}

function parseCsvRows(content: string): RawImportRow[] {
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  return rows.map((row, index) => ({
    rowNumber: cellToString(row.rowNumber),
    name: cellToString(row.name),
    description: cellToString(row.description),
    listPrice: cellToString(row.listPrice),
    finalPrice: cellToString(row.finalPrice),
    discountAvailability: cellToString(row.discountAvailability),
    lastDiscountPercent: cellToString(row.lastDiscountPercent),
    sourceRow: index + 2,
  }));
}

function parseExcelRows(buffer: Buffer): RawImportRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheetName];
  const table = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
    raw: false,
  });

  const [headerRow, ...dataRows] = table;
  const headers = (headerRow ?? []).map((header) => cellToString(header));

  const findColumn = (name: string) => headers.findIndex((header) => header === name);
  const columns = {
    rowNumber: findColumn("ردیف"),
    name: findColumn("نام کالا"),
    description: findColumn("توضیحات"),
    finalPrice: findColumn("قیمت اعلامی"),
    listPrice: findColumn("قیمت کف"),
    discountAvailability: findColumn("امکان تخفیف"),
    lastDiscountPercent: findColumn("اخرین درصد تخفیف"),
  };

  return dataRows
    .map((row, index) => ({ row, sourceRow: index + 2 }))
    .filter(({ row }) => row.some((cell) => cellToString(cell) !== ""))
    .map(({ row, sourceRow }) => ({
      rowNumber: cellToString(row[columns.rowNumber]),
      name: cellToString(row[columns.name]),
      description: cellToString(row[columns.description]),
      listPrice: cellToString(row[columns.listPrice]),
      finalPrice: cellToString(row[columns.finalPrice]),
      discountAvailability: cellToString(row[columns.discountAvailability]),
      lastDiscountPercent: cellToString(row[columns.lastDiscountPercent]),
      sourceRow,
    }));
}

function validateImportRow(row: RawImportRow, seenRowNumbers: Set<string>) {
  const parsed = productSchema.safeParse(row);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: `ردیف ${formatCount(row.sourceRow)}: ${parsed.error.issues[0].message}`,
    };
  }

  if (seenRowNumbers.has(parsed.data.rowNumber)) {
    return {
      ok: false as const,
      error: `ردیف ${formatCount(row.sourceRow)}: مقدار ردیف تکراری است.`,
    };
  }

  seenRowNumbers.add(parsed.data.rowNumber);
  return { ok: true as const, data: parsed.data };
}

async function importProductRows(rows: RawImportRow[]) {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];
  const seenRowNumbers = new Set<string>();

  for (const row of rows) {
    const validated = validateImportRow(row, seenRowNumbers);
    if (!validated.ok) {
      skipped += 1;
      errors.push(validated.error);
      continue;
    }

    const existing = await prisma.product.findUnique({
      where: { rowNumber: validated.data.rowNumber },
      select: { id: true },
    });

    if (existing) {
      await prisma.product.update({
        where: { rowNumber: validated.data.rowNumber },
        data: validated.data,
      });
      updated += 1;
    } else {
      await prisma.product.create({ data: validated.data });
      created += 1;
    }
  }

  return { created, updated, skipped, errors };
}

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

function redirectProductError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectProductError("/admin/products/new", parsed.error.issues[0].message);
  }

  try {
    await prisma.product.create({ data: parsed.data });
  } catch {
    redirectProductError("/admin/products/new", "این ردیف قبلا برای محصول دیگری ثبت شده است.");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectProductError(`/admin/products/${id}/edit`, parsed.error.issues[0].message);
  }

  try {
    await prisma.product.update({ where: { id }, data: parsed.data });
  } catch {
    redirectProductError(
      `/admin/products/${id}/edit`,
      "این ردیف قبلا برای محصول دیگری ثبت شده است.",
    );
  }

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

export async function importProductsAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "لطفا فایل اکسل یا CSV را انتخاب کنید." };
  }

  let rows: RawImportRow[];
  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith(".xlsx")) {
      rows = parseExcelRows(Buffer.from(await file.arrayBuffer()));
    } else if (fileName.endsWith(".csv")) {
      rows = parseCsvRows(await file.text());
    } else {
      return { ok: false, message: "فرمت فایل باید xlsx یا csv باشد." };
    }
  } catch {
    return { ok: false, message: "ساختار فایل معتبر نیست." };
  }

  if (!rows.length) {
    return { ok: false, message: "فایل انتخاب شده ردیف قابل وارد کردن ندارد." };
  }

  const result = await importProductRows(rows);

  revalidatePath("/");
  revalidatePath("/admin");

  return {
    ok: true,
    message: getImportMessage(result.created, result.updated, result.skipped, result.errors),
  };
}

export async function exportProductsCsv() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });

  return stringify(
    products.map((product) => ({
      rowNumber: product.rowNumber,
      name: product.name,
      description: product.description,
      listPrice: product.listPrice ?? "",
      finalPrice: product.finalPrice ?? "",
      discountAvailability: product.discountAvailability,
      lastDiscountPercent: product.lastDiscountPercent ?? "",
    })),
    { columns: csvHeaders, header: true },
  );
}

export async function exportProductsExcel() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    orderBy: [{ rowNumber: "asc" }, { name: "asc" }],
  });

  const rows = products.map((product) => [
    product.rowNumber,
    product.name,
    product.description,
    product.finalPrice ?? "",
    product.listPrice ?? "",
    product.discountAvailability,
    product.lastDiscountPercent ?? "",
  ]);

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([excelHeaders, ...rows]);
  sheet["!cols"] = [
    { wch: 12 },
    { wch: 24 },
    { wch: 70 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
