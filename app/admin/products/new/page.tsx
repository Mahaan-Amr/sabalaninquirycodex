import { createProductAction } from "../../actions";
import { AdminShell } from "../../AdminShell";
import { ProductForm } from "../ProductForm";

type NewProductPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const params = await searchParams;
  const errorValue = params.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;

  return (
    <AdminShell>
      <section className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">محصول جدید</h2>
        <ProductForm action={createProductAction} error={error} />
      </section>
    </AdminShell>
  );
}
