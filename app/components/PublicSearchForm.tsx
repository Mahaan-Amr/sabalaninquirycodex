"use client";

import { Search } from "lucide-react";
import { PriceInput } from "./PriceInput";

type PublicSearchFormProps = {
  query: string;
  minPrice?: number;
  maxPrice?: number;
};

const inputClass =
  "h-11 rounded-md border border-white/10 bg-slate-950/70 px-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300";

export function PublicSearchForm({ query, minPrice, maxPrice }: PublicSearchFormProps) {
  return (
    <form className="grid gap-2 sm:grid-cols-[1fr_9rem_9rem_auto]">
      <label className="relative block">
        <span className="sr-only">جستجوی محصول</span>
        <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          name="q"
          defaultValue={query}
          placeholder="ردیف، نام یا توضیحات محصول را جستجو کنید..."
          className="h-11 w-full rounded-md border border-white/10 bg-slate-950/70 pr-10 pl-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300"
        />
      </label>
      <PriceInput
        name="min"
        defaultValue={minPrice}
        placeholder="حداقل تومان"
        className={inputClass}
      />
      <PriceInput
        name="max"
        defaultValue={maxPrice}
        placeholder="حداکثر تومان"
        className={inputClass}
      />
      <button className="h-11 rounded-md bg-teal-400 px-5 font-semibold text-slate-950 transition hover:bg-teal-300">
        جستجو
      </button>
    </form>
  );
}
