import type { Product } from "@prisma/client";

type ProductFormProps = {
  product?: Product;
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

export function ProductForm({ product, action, error }: ProductFormProps) {
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
            defaultValue={product?.rowNumber}
            className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none focus:border-teal-300"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          نام کالا
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none focus:border-teal-300"
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
          قیمت کف، تومان
          <input
            name="listPrice"
            type="text"
            inputMode="numeric"
            defaultValue={product?.listPrice ?? ""}
            className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none focus:border-teal-300"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          قیمت اعلامی، تومان
          <input
            name="finalPrice"
            type="text"
            inputMode="numeric"
            defaultValue={product?.finalPrice ?? ""}
            className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none focus:border-teal-300"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-300">
          امکان تخفیف
          <input
            name="discountAvailability"
            defaultValue={product?.discountAvailability}
            placeholder="مثلا: دارد یا ندارد"
            className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none focus:border-teal-300 placeholder:text-slate-500"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-300">
          اخرین درصد تخفیف
          <input
            name="lastDiscountPercent"
            type="text"
            inputMode="decimal"
            defaultValue={product?.lastDiscountPercent ?? ""}
            className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none focus:border-teal-300"
          />
        </label>
      </div>
      <button className="h-12 rounded-md bg-teal-400 font-semibold text-slate-950 hover:bg-teal-300">
        ذخیره محصول
      </button>
    </form>
  );
}
