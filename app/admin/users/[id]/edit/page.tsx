import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateUserAction } from "@/app/admin/actions";
import { AdminShell } from "@/app/admin/AdminShell";
import { UserForm } from "../../UserForm";

type EditUserPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditUserPage({
  params,
  searchParams,
}: EditUserPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const errorValue = query.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    notFound();
  }

  return (
    <AdminShell>
      <section className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">ویرایش کاربر استعلام</h2>
        <UserForm
          user={user}
          action={updateUserAction.bind(null, user.id)}
          error={error}
        />
      </section>
    </AdminShell>
  );
}
