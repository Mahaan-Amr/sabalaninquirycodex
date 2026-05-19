"use client";

import { useActionState } from "react";
import { importCsvAction } from "@/app/admin/actions";

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importCsvAction, {});

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <label className="grid gap-2 text-sm text-slate-300">
        فایل CSV
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="rounded-md border border-white/10 bg-slate-950/80 px-3 py-3 text-white file:ml-3 file:rounded-md file:border-0 file:bg-teal-400 file:px-3 file:py-2 file:font-semibold file:text-slate-950"
        />
      </label>
      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-md border border-teal-400/20 bg-teal-500/10 p-3 text-sm text-teal-100"
              : "rounded-md border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100"
          }
        >
          {state.message}
        </p>
      ) : null}
      <button
        disabled={pending}
        className="h-12 rounded-md bg-teal-400 font-semibold text-slate-950 hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "در حال وارد کردن..." : "وارد کردن محصولات"}
      </button>
    </form>
  );
}
