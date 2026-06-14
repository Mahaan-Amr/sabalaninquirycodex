"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { PriceInput } from "./PriceInput";

type PublicSearchFormProps = {
  query: string;
  minPrice?: number;
  maxPrice?: number;
};

const inputClass =
  "h-11 rounded-md border border-white/10 bg-slate-950/70 px-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300";

export function PublicSearchForm({ query, minPrice, maxPrice }: PublicSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [queryValue, setQueryValue] = useState(query);
  const [minValue, setMinValue] = useState(String(minPrice ?? ""));
  const [maxValue, setMaxValue] = useState(String(maxPrice ?? ""));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQueryValue(query);
      setMinValue(String(minPrice ?? ""));
      setMaxValue(String(maxPrice ?? ""));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [query, minPrice, maxPrice]);

  const targetUrl = useMemo(() => {
    const params = new URLSearchParams();
    const trimmedQuery = queryValue.trim();
    const trimmedMin = minValue.trim();
    const trimmedMax = maxValue.trim();

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }
    if (trimmedMin) {
      params.set("min", trimmedMin);
    }
    if (trimmedMax) {
      params.set("max", trimmedMax);
    }

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [maxValue, minValue, pathname, queryValue]);

  const applySearch = useCallback(() => {
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl === targetUrl) {
      return;
    }

    startTransition(() => {
      router.replace(targetUrl, { scroll: false });
    });
  }, [router, targetUrl]);

  useEffect(() => {
    const timeout = window.setTimeout(applySearch, 300);
    return () => window.clearTimeout(timeout);
  }, [applySearch]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearch();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[1fr_9rem_9rem_auto]">
      <label className="relative block">
        <span className="sr-only">جستجوی محصول</span>
        <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          name="q"
          value={queryValue}
          onChange={(event) => setQueryValue(event.target.value)}
          placeholder="ردیف، نام یا توضیحات محصول را جستجو کنید..."
          className="h-11 w-full rounded-md border border-white/10 bg-slate-950/70 pr-10 pl-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300"
        />
      </label>
      <PriceInput
        name="min"
        defaultValue={minPrice}
        onValueChange={setMinValue}
        placeholder="حداقل تومان"
        className={inputClass}
      />
      <PriceInput
        name="max"
        defaultValue={maxPrice}
        onValueChange={setMaxValue}
        placeholder="حداکثر تومان"
        className={inputClass}
      />
      <button
        disabled={isPending}
        className="h-11 rounded-md bg-teal-400 px-5 font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-wait disabled:opacity-70"
      >
        جستجو
      </button>
    </form>
  );
}
