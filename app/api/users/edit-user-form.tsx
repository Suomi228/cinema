"use client";

import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EditUserForm({ user }: { user: any }) {
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [avatar, setAvatar] = useState(user.avatar);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_avatar");

    setUploading(true);

    const res = await fetch("https://api.cloudinary.com/v1_1/dit8lunbz/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAvatar(data.secure_url);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        email,
        role,
        password: user.password,
        avatar,
      }),
    });

    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-2">
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-1 w-full" />
      <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="border p-1 w-full" />

      <div>
        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="block" />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        {avatar && <img src={avatar} alt="avatar preview" width={100} className="mt-2" />}
      </div>

      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
    </form>
  );
}
