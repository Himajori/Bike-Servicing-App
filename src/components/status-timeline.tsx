"use client";

import { useState } from "react";
import type { BookingStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/booking-flow";
import { cn } from "@/lib/utils";

export function StatusTimeline({
  current,
  logs,
}: {
  current: BookingStatus;
  logs: { id: string; status: BookingStatus; note: string | null; createdAt: string }[];
}) {
  const currentIndex = Math.max(0, logs.findIndex((log) => log.status === current));
  const [openId, setOpenId] = useState<string | null>(logs[currentIndex]?.id ?? null);

  return (
    <div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${logs.length > 1 ? (currentIndex / (logs.length - 1)) * 100 : 12}%` }}
        />
      </div>
      <ol className="space-y-0">
        {logs.map((log, index) => {
          const active = log.status === current;
          const open = openId === log.id;
          return (
            <li key={log.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  aria-label={STATUS_LABELS[log.status]}
                  onClick={() => setOpenId(log.id)}
                  className={cn(
                    "mt-1 size-3 rounded-full border-2 border-background shadow",
                    active ? "bg-primary scale-125" : index <= currentIndex ? "bg-foreground/50" : "bg-foreground/20",
                  )}
                />
                {index < logs.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
              </div>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : log.id)}
                className="w-full pb-5 text-left"
              >
                <p className={cn("text-sm font-medium", active && "text-primary")}>
                  {STATUS_LABELS[log.status]}
                </p>
                {open ? (
                  <>
                    {log.note ? <p className="mt-0.5 text-sm text-muted-foreground">{log.note}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Tap to see the note</p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
