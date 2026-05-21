import { createUserAction } from "../../actions";
import { AdminShell } from "../../AdminShell";
import { UserForm } from "../UserForm";

type NewUserPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewUserPage({ searchParams }: NewUserPageProps) {
  const params = await searchParams;
  const errorValue = params.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;

  return (
    <AdminShell>
      <section className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">کاربر جدید استعلام</h2>
        <UserForm action={createUserAction} error={error} />
      </section>
    </AdminShell>
  );
}
