import Link from "next/link";
import { Download, FileSpreadsheet } from "lucide-react";
import { AdminShell } from "../AdminShell";
import { ImportForm } from "./ImportForm";

export default function ImportPage() {
  return (
    <AdminShell>
      <section className="mx-auto grid max-w-3xl gap-5">
        <div>
          <h2 className="text-xl font-bold text-white">ورود و خروج اطلاعات محصولات</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            فایل اکسل با قالب سبلان روش اصلی ورود اطلاعات است. CSV هم با ستون‌های انگلیسی پشتیبانی می‌شود.
          </p>
        </div>
        <p className="text-sm leading-7 text-slate-400">
          ورود اطلاعات فقط محصول‌ها را ایجاد یا بروزرسانی می‌کند و هیچ محصولی را حذف نمی‌کند. بروزرسانی بر اساس ستون «ردیف» انجام می‌شود.
        </p>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-semibold text-white">خروجی و قالب</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            برای ورود اطلاعات بهتر است از قالب اکسل استفاده کنید. خروجی اکسل با همان ستون‌های فارسی قالب ساخته می‌شود.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/admin/import/template"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-teal-300/40 px-4 text-teal-100 hover:border-teal-200"
            >
              <FileSpreadsheet className="size-4" />
              دانلود قالب اکسل
            </Link>
            <Link
              href="/admin/import/export/xlsx"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-teal-300/40 px-4 text-teal-100 hover:border-teal-200"
            >
              <Download className="size-4" />
              خروجی اکسل
            </Link>
            <Link
              href="/admin/import/export"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/10 px-4 text-slate-200 hover:border-teal-200"
            >
              <Download className="size-4" />
              خروجی CSV
            </Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">وارد کردن</h3>
          <ImportForm />
        </div>
      </section>
    </AdminShell>
  );
}
