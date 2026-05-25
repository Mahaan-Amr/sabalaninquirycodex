import { z } from "zod";
import { normalizeNumericText, normalizePercentText } from "@/lib/format";

function emptyToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

function optionalIntField(message: string) {
  return z.preprocess(
    (value) => {
      const normalized = emptyToNull(value);
      if (normalized === null || normalized === undefined) {
        return null;
      }

      return typeof normalized === "string" ? normalizeNumericText(normalized) : normalized;
    },
    z.coerce
      .number({ message })
      .int(message)
      .nonnegative(message)
      .nullable(),
  );
}

function optionalPercentField() {
  return z.preprocess(
    (value) => {
      const normalized = emptyToNull(value);
      if (normalized === null || normalized === undefined) {
        return null;
      }

      return typeof normalized === "string" ? normalizePercentText(normalized) : normalized;
    },
    z.coerce
      .number({ message: "درصد تخفیف باید عددی بین ۰ تا ۱۰۰ باشد." })
      .min(0, "درصد تخفیف باید عددی بین ۰ تا ۱۰۰ باشد.")
      .max(100, "درصد تخفیف باید عددی بین ۰ تا ۱۰۰ باشد.")
      .nullable(),
  );
}

export const productSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return value;
    }

    const product = value as Record<string, unknown>;
    const discountAvailability = String(product.discountAvailability ?? "").trim();

    if (discountAvailability === "" || discountAvailability === "ندارد") {
      return { ...product, lastDiscountPercent: "" };
    }

    return value;
  },
  z.object({
    rowNumber: z.string().trim().min(1, "ردیف الزامی است."),
    name: z.string().trim().min(1, "نام کالا الزامی است."),
    description: z.string().trim().optional().default(""),
    listPrice: optionalIntField("قیمت کف باید عدد صحیح و غیرمنفی باشد."),
    finalPrice: optionalIntField("قیمت اعلامی باید عدد صحیح و غیرمنفی باشد."),
    discountAvailability: z
      .string()
      .trim()
      .transform((value) => value || "ندارد"),
    lastDiscountPercent: optionalPercentField(),
  })
  .transform((product) => ({
    ...product,
    lastDiscountPercent:
      product.discountAvailability === "ندارد" ? null : product.lastDiscountPercent,
  })),
);

export type ProductInput = z.infer<typeof productSchema>;

const usernameSchema = z
  .string()
  .trim()
  .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد.")
  .max(50, "نام کاربری باید حداکثر ۵۰ کاراکتر باشد.")
  .regex(/^[A-Za-z0-9._-]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه، زیرخط و خط تیره باشد.");

export const createUserSchema = z.object({
  username: usernameSchema,
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد."),
});

export const updateUserSchema = z.object({
  username: usernameSchema,
  password: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length === 0 || value.length >= 8, {
      message: "رمز عبور جدید باید حداقل ۸ کاراکتر باشد.",
    }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
