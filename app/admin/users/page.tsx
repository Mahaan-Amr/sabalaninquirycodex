import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPersianDateTime } from "@/lib/format";
import { AdminShell } from "../AdminShell";
import { deleteUserAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ updatedAt: "desc" }, { username: "asc" }],
  });

  return (
    <AdminShell>
      <section className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">کاربران استعلام</h2>
            <p className="mt-1 text-sm text-slate-400">
              حساب‌های کاربری مجاز برای دسترسی به صفحه استعلام محصولات را مدیریت کنید.
            </p>
          </div>
          <Link
            href="/admin/users/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-400 px-4 font-semibold text-slate-950 hover:bg-teal-300"
          >
            <Plus className="size-4" />
            کاربر جدید
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
          <div className="hidden grid-cols-[1fr_1fr_auto] gap-4 border-b border-white/10 px-4 py-3 text-sm text-slate-400 md:grid">
            <span>نام کاربری</span>
            <span>آخرین ویرایش</span>
            <span>عملیات</span>
          </div>
          {users.length ? (
            <div className="divide-y divide-white/10">
              {users.map((user) => (
                <article
                  key={user.id}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_auto] md:items-center"
                >
                  <div>
                    <h3 className="font-semibold text-white">{user.username}</h3>
                    <time
                      dateTime={user.createdAt.toISOString()}
                      className="mt-1 block text-xs text-slate-500 md:hidden"
                    >
                      ایجاد: {formatPersianDateTime(user.createdAt)}
                    </time>
                  </div>
                  <time
                    dateTime={user.updatedAt.toISOString()}
                    className="text-sm text-slate-300"
                  >
                    {formatPersianDateTime(user.updatedAt)}
                  </time>
                  <div className="flex items-center gap-2">
                    <Link
                      aria-label="ویرایش کاربر"
                      href={`/admin/users/${user.id}/edit`}
                      className="inline-flex size-10 items-center justify-center rounded-md border border-white/10 text-slate-200 hover:border-teal-300"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <form action={deleteUserAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <button
                        aria-label="حذف کاربر"
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
            <div className="p-8 text-center text-slate-300">هنوز کاربری برای استعلام ایجاد نشده است.</div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
