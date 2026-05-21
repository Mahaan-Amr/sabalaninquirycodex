import { exportProductsExcel } from "@/app/admin/actions";

export async function GET() {
  const workbook = await exportProductsExcel();

  return new Response(new Uint8Array(workbook), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="sabalan-products.xlsx"',
    },
  });
}
