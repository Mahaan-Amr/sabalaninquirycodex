import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  displayDiscountAvailability,
  displayText,
  formatDiscountPercent,
  formatOptionalToman,
  formatPersianDateTime,
} from "@/lib/format";
import { deleteProductAction } from "./actions";
import { AdminShell } from "./AdminShell";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const qValue = params.q;
  const query = (Array.isArray(qValue) ? qValue[0] : qValue)?.trim() ?? "";

  const products = await prisma.product.findMany({
    where: query
      ? {
          OR: [
            { rowNumber: { contains: query } },
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        }
      : undefined,
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });

  return (
    <AdminShell>
      <section className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form className="flex flex-1 gap-2">
            <input
              name="q"
              defaultValue={query}
              placeholder="جستجو بر اساس ردیف، نام یا توضیحات..."
              className="h-11 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-white outline-none focus:border-teal-300"
            />
            <button className="rounded-md border border-white/10 px-4 text-slate-200 hover:border-teal-300">
              جستجو
            </button>
          </form>
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-400 px-4 font-semibold text-slate-950 hover:bg-teal-300"
          >
            <Plus className="size-4" />
            محصول جدید
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
          <div className="hidden grid-cols-[7rem_1.2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/10 px-4 py-3 text-sm text-slate-400 xl:grid">
            <span>ردیف</span>
            <span>محصول</span>
            <span>قیمت اعلامی</span>
            <span>قیمت کف</span>
            <span>تخفیف</span>
            <span>عملیات</span>
          </div>
          {products.length ? (
            <div className="divide-y divide-white/10">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="grid gap-3 px-4 py-4 xl:grid-cols-[7rem_1.2fr_1fr_1fr_1fr_auto] xl:items-center"
                >
                  <div className="text-sm font-semibold text-teal-100">{product.rowNumber}</div>
                  <div>
                    <h2 className="font-semibold text-white">{product.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                      {displayText(product.description)}
                    </p>
                    <div className="mt-2 grid gap-1 text-xs text-slate-500 xl:hidden">
                      <span>قیمت اعلامی: {formatOptionalToman(product.finalPrice)}</span>
                      <span>قیمت کف: {formatOptionalToman(product.listPrice)}</span>
                      <span>
                        امکان تخفیف: {displayDiscountAvailability(product.discountAvailability)} / اخرین درصد:{" "}
                        {formatDiscountPercent(product.lastDiscountPercent)}
                      </span>
                      <time dateTime={product.updatedAt.toISOString()}>
                        ویرایش: {formatPersianDateTime(product.updatedAt)}
                      </time>
                    </div>
                  </div>
                  <div className="hidden text-sm font-semibold text-teal-100 xl:block">
                    {formatOptionalToman(product.finalPrice)}
                  </div>
                  <div className="hidden text-sm text-slate-200 xl:block">
                    {formatOptionalToman(product.listPrice)}
                  </div>
                  <div className="hidden grid gap-1 text-xs text-slate-400 xl:grid">
                    <span>امکان: {displayDiscountAvailability(product.discountAvailability)}</span>
                    <span>درصد: {formatDiscountPercent(product.lastDiscountPercent)}</span>
                    <time dateTime={product.updatedAt.toISOString()}>
                      ویرایش: {formatPersianDateTime(product.updatedAt)}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      aria-label="ویرایش"
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex size-10 items-center justify-center rounded-md border border-white/10 text-slate-200 hover:border-teal-300"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        aria-label="حذف"
                        className="inline-flex size-10 items-center justify-center rounded-md border border-red-400/20 text-red-100 hover:border-red-300"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-300">محصولی ثبت نشده است.</div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
