// app/users/page.tsx
import AddUserForm from "../api/users/add-user-form";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <AddUserForm />
      <ul className="mt-6 space-y-2">
        {users.map((user) => (
          <li key={user.id} className="border p-2 rounded">
            <strong>{user.email}</strong> — {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
