import { PhoneShell } from "@/components/phone-shell";
import { BottomNav } from "@/components/bottom-nav";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneShell>
      <div className="flex min-h-dvh flex-1 flex-col">
        <div className="flex-1">{children}</div>
        <BottomNav />
      </div>
    </PhoneShell>
  );
}
