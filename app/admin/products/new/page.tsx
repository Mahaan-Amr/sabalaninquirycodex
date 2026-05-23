import { prisma } from "@/lib/prisma";
import { createProductAction } from "../../actions";
import { AdminShell } from "../../AdminShell";
import { ProductForm } from "../ProductForm";

type NewProductPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSmallestAvailableRowNumber(rowNumbers: string[]) {
  const usedNumbers = new Set(
    rowNumbers
      .map((rowNumber) => Number.parseInt(rowNumber, 10))
      .filter((rowNumber) => Number.isInteger(rowNumber) && rowNumber > 0),
  );

  let candidate = 1;
  while (usedNumbers.has(candidate)) {
    candidate += 1;
  }

  return String(candidate);
}

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const params = await searchParams;
  const errorValue = params.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;
  const products = await prisma.product.findMany({ select: { rowNumber: true } });
  const defaultRowNumber = getSmallestAvailableRowNumber(
    products.map((product) => product.rowNumber),
  );

  return (
    <AdminShell>
      <section className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">محصول جدید</h2>
        <ProductForm
          action={createProductAction}
          error={error}
          defaultRowNumber={defaultRowNumber}
        />
      </section>
    </AdminShell>
  );
}
