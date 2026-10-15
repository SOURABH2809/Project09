import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

const profileOptions = [
  ["Personal details", "Update your name, email, and profile image."],
  ["Orders", "View your recent orders and order history."],
  ["Addresses", "Manage your delivery and billing addresses."],
  ["Security", "Change your password and manage account security."],
] as const;

export default function MyProfile() {
  return (
    <section id="my-profile" className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My profile</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your account and preferences.</p>
        </div>
        <LogoutButton className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {profileOptions.map(([title, description]) => (
          <Link
            key={title}
            href="#"
            className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
