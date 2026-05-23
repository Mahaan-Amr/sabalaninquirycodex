"use client";

import { useState } from "react";
import { PriceInput } from "@/app/components/PriceInput";

export type ProductFormValue = {
  rowNumber: string;
  name: string;
  description: string;
  listPrice: number | null;
  finalPrice: number | null;
  discountAvailability: string;
  lastDiscountPercent: number | null;
};

type ProductFormProps = {
  product?: ProductFormValue;
  defaultRowNumber?: string;
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

const inputClass =
  "h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none focus:border-teal-300 disabled:cursor-not-allowed disabled:opacity-60";

export function ProductForm({ product, defaultRowNumber, action, error }: ProductFormProps) {
  const initialDiscount =
    product?.discountAvailability === "دارد" ? "دارد" : "ندارد";
  const [discountAvailability, setDiscountAvailability] = useState(initialDiscount);
  const discountEnabled = discountAvailability === "دارد";

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      {error ? (
        <p className="rounded-md border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <label className="grid gap-2 text-sm text-slate-300">
          ردیف
          <input
            name="rowNumber"
            required
            defaultValue={product?.rowNumber ?? defaultRowNumber ?? ""}
            className={inputClass}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          نام کالا
          <input
            name="name"
            required
            defaultValue={product?.name}
            className={inputClass}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-slate-300">
        توضیحات
        <textarea
          name="description"
          rows={5}
          defaultValue={product?.description}
          className="rounded-md border border-white/10 bg-slate-950/80 px-3 py-3 leading-7 text-white outline-none focus:border-teal-300"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          قیمت اعلامی، تومان
          <PriceInput
            name="finalPrice"
            defaultValue={product?.finalPrice}
            className={inputClass}
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          قیمت کف، تومان
          <PriceInput
            name="listPrice"
            defaultValue={product?.listPrice}
            className={inputClass}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="grid gap-2 text-sm text-slate-300">
          <legend>امکان تخفیف</legend>
          <input type="hidden" name="discountAvailability" value={discountAvailability} />
          <div className="grid h-12 grid-cols-2 overflow-hidden rounded-md border border-white/10 bg-slate-950/80">
            {(["ندارد", "دارد"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDiscountAvailability(option)}
                className={
                  discountAvailability === option
                    ? "bg-teal-400 font-semibold text-slate-950"
                    : "text-slate-300 hover:bg-white/[0.04]"
                }
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-2 text-sm text-slate-300">
          اخرین درصد تخفیف
          <PriceInput
            name="lastDiscountPercent"
            defaultValue={discountEnabled ? product?.lastDiscountPercent : ""}
            className={inputClass}
            decimal
            disabled={!discountEnabled}
          />
        </label>
      </div>
      <button className="h-12 rounded-md bg-teal-400 font-semibold text-slate-950 hover:bg-teal-300">
        ذخیره محصول
      </button>
    </form>
  );
}
