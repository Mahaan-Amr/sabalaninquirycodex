import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPersianDateTime, formatToman } from "@/lib/format";
import { deleteProductAction } from "./actions";
import { AdminShell } from "./AdminShell";

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
            placeholder="جستجو در محصولات..."
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
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] gap-4 border-b border-white/10 px-4 py-3 text-sm text-slate-400 lg:grid">
          <span>محصول</span>
          <span>قیمت لیست</span>
          <span>قیمت نهایی</span>
          <span>تاریخ‌ها</span>
          <span>عملیات</span>
        </div>
        {products.length ? (
          <div className="divide-y divide-white/10">
            {products.map((product) => (
              <article
                key={product.id}
                className="grid gap-3 px-4 py-4 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] lg:items-center"
              >
                <div>
                  <h2 className="font-semibold text-white">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                    {product.description}
                  </p>
                  <div className="mt-2 grid gap-1 text-xs text-slate-500 lg:hidden">
                    <time dateTime={product.createdAt.toISOString()}>
                      ایجاد: {formatPersianDateTime(product.createdAt)}
                    </time>
                    <time dateTime={product.updatedAt.toISOString()}>
                      ویرایش: {formatPersianDateTime(product.updatedAt)}
                    </time>
                  </div>
                </div>
                <div className="text-sm text-slate-200">{formatToman(product.listPrice)}</div>
                <div className="text-sm font-semibold text-teal-100">
                  {formatToman(product.finalPrice)}
                </div>
                <div className="hidden grid gap-1 text-xs text-slate-400 lg:grid">
                  <time dateTime={product.createdAt.toISOString()}>
                    ایجاد: {formatPersianDateTime(product.createdAt)}
                  </time>
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
