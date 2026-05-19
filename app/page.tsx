import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPersianDateTime, formatToman, toSafeInt } from "@/lib/format";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = getParam(params, "q")?.trim() ?? "";
  const minPrice = toSafeInt(getParam(params, "min"));
  const maxPrice = toSafeInt(getParam(params, "max"));

  const products = await prisma.product.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
              ],
            }
          : {},
        minPrice !== undefined ? { finalPrice: { gte: minPrice } } : {},
        maxPrice !== undefined ? { finalPrice: { lte: maxPrice } } : {},
      ],
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    take: 50,
  });

  const hasFilters = query || minPrice !== undefined || maxPrice !== undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-teal-200/80">سامانه استعلام قیمت</p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-4xl">
            استعلام قیمت سبلان
          </h1>
        </div>
        <Link
          href="/admin"
          className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:border-teal-300/60 hover:text-white"
        >
          ورود مدیر
        </Link>
      </header>

      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20">
        <form className="grid gap-3 sm:grid-cols-[1fr_10rem_10rem_auto]">
          <label className="relative block">
            <span className="sr-only">جستجوی محصول</span>
            <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder="نام یا توضیحات محصول را جستجو کنید..."
              className="h-12 w-full rounded-md border border-white/10 bg-slate-950/70 pr-10 pl-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300"
            />
          </label>
          <input
            name="min"
            inputMode="numeric"
            defaultValue={minPrice ?? ""}
            placeholder="حداقل تومان"
            className="h-12 rounded-md border border-white/10 bg-slate-950/70 px-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300"
          />
          <input
            name="max"
            inputMode="numeric"
            defaultValue={maxPrice ?? ""}
            placeholder="حداکثر تومان"
            className="h-12 rounded-md border border-white/10 bg-slate-950/70 px-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300"
          />
          <button className="h-12 rounded-md bg-teal-400 px-5 font-semibold text-slate-950 transition hover:bg-teal-300">
            جستجو
          </button>
        </form>
      </section>

      <section className="flex-1">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-300">
          <span>
            {hasFilters
              ? `${products.length.toLocaleString("fa-IR")} نتیجه پیدا شد`
              : "برای شروع، نام محصول یا بازه قیمت را وارد کنید"}
          </span>
          {hasFilters ? (
            <Link href="/" className="text-teal-200 hover:text-teal-100">
              پاک کردن فیلترها
            </Link>
          ) : null}
        </div>

        {products.length > 0 ? (
          <div className="grid gap-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-lg border border-white/10 bg-slate-950/55 p-4"
              >
                <h2 className="text-lg font-bold text-white">{product.name}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-300">
                  {product.description}
                </p>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-md bg-white/[0.04] p-3">
                    <span className="block text-slate-400">قیمت لیست</span>
                    <strong className="mt-1 block text-slate-100">
                      {formatToman(product.listPrice)}
                    </strong>
                  </div>
                  <div className="rounded-md bg-teal-400/10 p-3">
                    <span className="block text-teal-100/80">قیمت نهایی</span>
                    <strong className="mt-1 block text-teal-100">
                      {formatToman(product.finalPrice)}
                    </strong>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                  <p>
                    <span className="text-slate-500">تاریخ ایجاد: </span>
                    <time dateTime={product.createdAt.toISOString()}>
                      {formatPersianDateTime(product.createdAt)}
                    </time>
                  </p>
                  <p>
                    <span className="text-slate-500">آخرین ویرایش: </span>
                    <time dateTime={product.updatedAt.toISOString()}>
                      {formatPersianDateTime(product.updatedAt)}
                    </time>
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : hasFilters ? (
          <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-slate-300">
            محصولی با این مشخصات پیدا نشد.
          </div>
        ) : null}
      </section>
    </main>
  );
}
