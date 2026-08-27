"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";

type Note = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export function NotificationInbox() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await api<{ notifications: Note[] }>("/api/notifications");
    setNotes(data.notifications);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load alerts."))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await api(`/api/notifications/${id}/read`, { method: "POST" });
    await load();
  }

  if (loading) return <div className="h-24 animate-pulse rounded-2xl bg-muted" />;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (notes.length === 0) {
    return <EmptyState title="No alerts yet" body="Booking and job updates show up here." />;
  }

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li
          key={note.id}
          className={`rounded-2xl border bg-card p-4 ${note.read ? "opacity-70" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{note.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{note.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
            {!note.read ? (
              <Button size="sm" variant="outline" onClick={() => void markRead(note.id)}>
                Mark read
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
