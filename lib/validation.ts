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
