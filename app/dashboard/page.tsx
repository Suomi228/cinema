import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <p>Role: {user.role}</p>
      <img
        src={user.avatar}
        width={100}
        alt="Avatar"
      />
      <LogoutButton />
    </div>
  );
}
