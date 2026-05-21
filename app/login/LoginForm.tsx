"use client";

import { useActionState } from "react";
import { userLoginAction } from "@/app/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(userLoginAction, {});

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-2 text-sm text-slate-300">
        نام کاربری
        <input
          name="username"
          required
          autoComplete="username"
          className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none transition focus:border-teal-300"
        />
      </label>
      <label className="grid gap-2 text-sm text-slate-300">
        رمز عبور
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none transition focus:border-teal-300"
        />
      </label>
      {state.message ? (
        <p className="rounded-md border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
          {state.message}
        </p>
      ) : null}
      <button
        disabled={pending}
        className="h-12 rounded-md bg-teal-400 font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}
