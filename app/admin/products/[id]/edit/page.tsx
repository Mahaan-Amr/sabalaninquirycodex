import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProductAction } from "@/app/admin/actions";
import { AdminShell } from "@/app/admin/AdminShell";
import { ProductForm, type ProductFormValue } from "../../ProductForm";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toProductFormValue(product: ProductFormValue): ProductFormValue {
  return product;
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const errorValue = query.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      rowNumber: true,
      name: true,
      description: true,
      listPrice: true,
      finalPrice: true,
      discountAvailability: true,
      lastDiscountPercent: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <AdminShell>
      <section className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">ویرایش محصول</h2>
        <ProductForm
          product={toProductFormValue(product)}
          action={updateProductAction.bind(null, id)}
          error={error}
        />
      </section>
    </AdminShell>
  );
}
