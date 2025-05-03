"use client";

import { useRouter } from "next/navigation";

export default function DeleteUserButton({ id }: { id: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      className="ml-4 text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}
