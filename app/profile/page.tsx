import LogoutButton from "@/components/LogoutButton";
import ProfileForm from "@/components/ProfileForm";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProfileForm user={user} />
    </div>
  );
}
