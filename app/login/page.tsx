import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getUserSession();
  if (session) {
    const activeUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true },
    });
    if (activeUser) {
      redirect("/");
    }
  }

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
