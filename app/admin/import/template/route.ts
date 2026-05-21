import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();
  const templatePath = path.join(process.cwd(), "excel", "inquiry.xlsx");
  const template = await readFile(templatePath);

  return new Response(new Uint8Array(template), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="inquiry-template.xlsx"',
    },
  });
}
