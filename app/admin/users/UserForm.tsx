import type { User } from "@prisma/client";

type UserFormProps = {
  user?: User;
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

export function UserForm({ user, action, error }: UserFormProps) {
  return (
    <form action={action} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      {error ? (
        <p className="rounded-md border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      <label className="grid gap-2 text-sm text-slate-300">
        نام کاربری
        <input
          name="username"
          required
          minLength={3}
          maxLength={50}
          defaultValue={user?.username}
          autoComplete="username"
          className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none focus:border-teal-300"
        />
      </label>
      <label className="grid gap-2 text-sm text-slate-300">
        {user ? "رمز عبور جدید" : "رمز عبور"}
        <input
          name="password"
          type="password"
          required={!user}
          minLength={user ? undefined : 8}
          autoComplete="new-password"
          placeholder={user ? "برای حفظ رمز فعلی خالی بگذارید" : undefined}
          className="h-12 rounded-md border border-white/10 bg-slate-950/80 px-3 text-white outline-none focus:border-teal-300 placeholder:text-slate-500"
        />
      </label>
      <button className="h-12 rounded-md bg-teal-400 font-semibold text-slate-950 hover:bg-teal-300">
        ذخیره کاربر
      </button>
    </form>
  );
}
