import Link from "next/link";
import { LogOut } from "lucide-react";
import { userLogoutAction } from "@/app/actions";
import { PublicSearchForm } from "@/app/components/PublicSearchForm";
import { LoginForm } from "@/app/login/LoginForm";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/auth";
import { filterProductsBySearch } from "@/lib/productSearch";
import {
  displayDiscountAvailability,
  formatDiscountPercent,
  formatOptionalToman,
  formatPersianDateTime,
  toSafeInt,
} from "@/lib/format";

export const dynamic = "force-dynamic";

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
  const session = await getUserSession();
  const activeUser = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true },
      })
    : null;

  if (!session || !activeUser) {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4 py-8">
        <section className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
          <p className="text-sm text-teal-200/80">سامانه استعلام قیمت سبلان</p>
          <h1 className="mt-2 text-2xl font-bold text-white">ورود به سامانه</h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            نام کاربری و رمز عبوری را وارد کنید که مدیر برای شما ایجاد کرده است.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
          <Link
            href="/admin/login"
            className="mt-4 inline-block text-sm text-teal-200 hover:text-teal-100"
          >
            ورود مدیر
          </Link>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const query = getParam(params, "q")?.trim() ?? "";
  const minPrice = toSafeInt(getParam(params, "min"));
  const maxPrice = toSafeInt(getParam(params, "max"));

  const productCandidates = await prisma.product.findMany({
    where: {
      AND: [
        minPrice !== undefined ? { finalPrice: { gte: minPrice } } : {},
        maxPrice !== undefined ? { finalPrice: { lte: maxPrice } } : {},
      ],
    },
    orderBy: [{ rowNumber: "asc" }, { name: "asc" }],
    take: query ? undefined : 50,
  });
  const products = filterProductsBySearch(productCandidates, query).slice(0, 50);

  const hasFilters = query || minPrice !== undefined || maxPrice !== undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-teal-200/80">سامانه استعلام قیمت</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            استعلام قیمت سبلان
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin"
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:border-teal-300/60 hover:text-white"
          >
            ورود مدیر
          </Link>
          <form action={userLogoutAction}>
            <button className="inline-flex items-center gap-2 rounded-md border border-red-400/20 px-3 py-2 text-sm text-red-100 hover:border-red-300">
              <span>{session.username}</span>
              <LogOut className="size-4" />
              خروج
            </button>
          </form>
        </div>
      </header>

      <section className="mb-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/20">
        <PublicSearchForm query={query} minPrice={minPrice} maxPrice={maxPrice} />
      </section>

      <section className="flex-1">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-300">
          <span>
            {hasFilters
              ? `${products.length.toLocaleString("fa-IR")} نتیجه پیدا شد`
              : "برای شروع، ردیف، نام محصول یا بازه قیمت را وارد کنید"}
          </span>
          {hasFilters ? (
            <Link href="/" className="text-teal-200 hover:text-teal-100">
              پاک کردن فیلترها
            </Link>
          ) : null}
        </div>

        {products.length > 0 ? (
          <div className="grid gap-2">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-lg border border-white/10 bg-slate-950/55 px-4 py-3"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teal-100">ردیف {product.rowNumber}</p>
                    <h2 className="mt-1 text-base font-bold leading-7 text-white sm:text-lg">
                      {product.name}
                    </h2>
                  </div>
                </div>

                {product.description ? (
                  <p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-300">
                    {product.description}
                  </p>
                ) : null}

                <dl className="mt-2 grid gap-1 text-sm leading-7 text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">قیمت اعلامی:</dt>
                    <dd className="font-semibold text-teal-100">
                      {formatOptionalToman(product.finalPrice)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">قیمت کف:</dt>
                    <dd className="font-semibold text-slate-100">
                      {formatOptionalToman(product.listPrice)}
                    </dd>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
                    <span>
                      <span className="text-slate-400">امکان تخفیف: </span>
                      <strong className="text-slate-100">
                        {displayDiscountAvailability(product.discountAvailability)}
                      </strong>
                    </span>
                    <span>
                      <span className="text-slate-400">درصد تخفیف: </span>
                      <strong className="text-slate-100">
                        {formatDiscountPercent(product.lastDiscountPercent)}
                      </strong>
                    </span>
                  </div>
                </dl>

                <p className="mt-2 text-xs text-slate-400">
                  <span className="text-slate-500">آخرین ویرایش: </span>
                  <time dateTime={product.updatedAt.toISOString()}>
                    {formatPersianDateTime(product.updatedAt)}
                  </time>
                </p>
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
