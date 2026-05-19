import Link from "next/link";
import { Download } from "lucide-react";
import { AdminShell } from "../AdminShell";
import { ImportForm } from "./ImportForm";

export default function ImportPage() {
  return (
    <AdminShell>
      <section className="mx-auto grid max-w-3xl gap-5">
      <div>
        <h2 className="text-xl font-bold text-white">ورود و خروج CSV</h2>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          ستون‌های فایل باید به این شکل باشد: id, name, description, listPrice, finalPrice
        </p>
      </div>
      <p className="text-sm leading-7 text-slate-400">
        ستون‌های createdAt و updatedAt در خروجی فقط برای اطلاع هستند و هنگام ورود CSV نادیده گرفته می‌شوند.
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="font-semibold text-white">خروجی گرفتن</h3>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          فایل خروجی را می‌توانید بعدا دوباره وارد کنید. ردیف‌هایی که شناسه معتبر داشته باشند بروزرسانی می‌شوند.
        </p>
        <Link
          href="/admin/import/export"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-md border border-teal-300/40 px-4 text-teal-100 hover:border-teal-200"
        >
          <Download className="size-4" />
          دانلود CSV
        </Link>
      </div>
      <div>
        <h3 className="mb-3 font-semibold text-white">وارد کردن</h3>
        <ImportForm />
      </div>
      </section>
    </AdminShell>
  );
}
