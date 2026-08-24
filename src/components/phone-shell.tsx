import type { ReactNode } from "react";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[oklch(0.18_0.02_55)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background shadow-[0_0_80px_rgba(0,0,0,0.35)]">
        {children}
      </div>
    </div>
  );
}
