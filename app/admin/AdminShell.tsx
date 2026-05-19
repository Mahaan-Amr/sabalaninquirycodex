import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "./actions";
import { requireAdmin } from "@/lib/auth";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-teal-200/80">پنل مدیریت</p>
          <h1 className="mt-1 text-2xl font-bold text-white">استعلام قیمت سبلان</h1>
          <p className="mt-1 text-xs text-slate-400">{session.email}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            className="rounded-md border border-white/10 px-3 py-2 text-slate-200 hover:border-teal-300"
            href="/"
          >
            صفحه استعلام
          </Link>
          <Link
            className="rounded-md border border-white/10 px-3 py-2 text-slate-200 hover:border-teal-300"
            href="/admin"
          >
            محصولات
          </Link>
          <Link
            className="rounded-md border border-white/10 px-3 py-2 text-slate-200 hover:border-teal-300"
            href="/admin/import"
          >
            CSV
          </Link>
          <form action={logoutAction}>
            <button className="inline-flex items-center gap-2 rounded-md border border-red-400/20 px-3 py-2 text-red-100 hover:border-red-300">
              <LogOut className="size-4" />
              خروج
            </button>
          </form>
        </nav>
      </header>
      {children}
    </main>
  );
}
