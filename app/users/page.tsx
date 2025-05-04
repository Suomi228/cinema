"use client";
import AddUserForm from "../api/users/add-user-form";
import EditUserForm from "../api/users/edit-user-form";
import DeleteUserButton from "../api/users/delete";
import axios from "axios";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const checkAdminAndFetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      if (res.status === 200) {
        setIsAdmin(true);
        setUsers(res.data);
      } else if (res.status === 403) {
        setIsAdmin(false);
        toast.error("Нет доступа: только админы могут просматривать пользователей");
      }
    } catch (err) {
      console.error("Error checking admin or fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-800" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <p>У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <AddUserForm onUserAdded={checkAdminAndFetchUsers} />
      <ul className="mt-6 space-y-4">
        {users.map((user) => (
          <li key={user.id} className="border p-4 rounded">
            <strong>{user.email}</strong> — {user.role}
            <EditUserForm user={user} />
            <DeleteUserButton id={user.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
