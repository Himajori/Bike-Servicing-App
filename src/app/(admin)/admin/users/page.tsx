"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type User = { id: string; name: string; email: string; role: string; phone: string | null };

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading users…</p>}>
      <UsersTable />
    </Suspense>
  );
}

function UsersTable() {
  const params = useSearchParams();
  const role = params.get("role");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api<{ users: User[] }>("/api/admin/users")
      .then((d) => setUsers(d.users))
      .catch(() => undefined);
  }, []);

  const visible = useMemo(
    () => users.filter((user) => !role || user.role === role),
    [users, role],
  );

  return (
    <main>
      <h1 className="font-heading text-3xl">{role === "MECHANIC" ? "Mechanics" : "Users"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {role === "MECHANIC" ? (
          <Link href="/admin/users" className="text-primary">
            Show all roles
          </Link>
        ) : (
          <Link href="/admin/users?role=MECHANIC" className="text-primary">
            Mechanics only
          </Link>
        )}
      </p>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((user) => (
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
