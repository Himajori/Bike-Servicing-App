"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type User = { id: string; name: string; email: string; role: string; phone: string | null };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    api<{ users: User[] }>("/api/admin/users").then((d) => setUsers(d.users)).catch(() => undefined);
  }, []);
  return (
    <main>
      <h1 className="font-heading text-3xl">Users</h1>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-2">{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
