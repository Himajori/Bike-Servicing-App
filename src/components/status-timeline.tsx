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
  return (
    <ol className="space-y-0">
      {logs.map((log, index) => {
        const active = log.status === current;
        return (
          <li key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 size-2.5 rounded-full",
                  active ? "bg-primary" : "bg-foreground/30",
                )}
              />
              {index < logs.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
            </div>
            <div className="pb-5">
              <p className={cn("text-sm font-medium", active && "text-primary")}>
                {STATUS_LABELS[log.status]}
              </p>
              {log.note ? <p className="mt-0.5 text-sm text-muted-foreground">{log.note}</p> : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
