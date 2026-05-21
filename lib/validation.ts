import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "نام محصول الزامی است."),
  description: z.string().trim().min(1, "توضیحات محصول الزامی است."),
  listPrice: z.coerce
    .number({ message: "قیمت لیست باید عدد باشد." })
    .int("قیمت لیست باید عدد صحیح باشد.")
    .nonnegative("قیمت لیست نمی‌تواند منفی باشد."),
  finalPrice: z.coerce
    .number({ message: "قیمت نهایی باید عدد باشد." })
    .int("قیمت نهایی باید عدد صحیح باشد.")
    .nonnegative("قیمت نهایی نمی‌تواند منفی باشد."),
});

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
