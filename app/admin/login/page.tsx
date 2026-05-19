import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4 py-8">
      <section className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30">
        <p className="text-sm text-teal-200/80">استعلام قیمت سبلان</p>
        <h1 className="mt-2 text-2xl font-bold text-white">ورود مدیر</h1>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          برای مدیریت محصولات، اطلاعات مدیر را وارد کنید.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
