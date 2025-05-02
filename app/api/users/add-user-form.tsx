'use client';

import { useState } from 'react';

export default function AddUserForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    console.log('Created:', data);
    setEmail('');
    setPassword('');
    setRole('');
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
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Add User
      </button>
    </form>
  );
}
