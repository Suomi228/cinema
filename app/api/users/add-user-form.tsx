"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    setLoading(false);

    if (res.ok) {
      setEmail("");
      setPassword("");
      setRole("");
      router.refresh();
    } else {
      console.error("Error creating user");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="border px-4 py-2 w-full"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="border px-4 py-2 w-full"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        className="border px-4 py-2 w-full"
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
        ) : null}
        {loading ? "Adding..." : "Add User"}
      </button>
    </form>
  );
}
