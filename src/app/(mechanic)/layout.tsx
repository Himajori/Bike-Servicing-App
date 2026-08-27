import { PhoneShell } from "@/components/phone-shell";
import { MechanicNav } from "@/components/mechanic-nav";

export default function MechanicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneShell>
      <div className="flex min-h-dvh flex-1 flex-col">
        <div className="flex-1">{children}</div>
        <MechanicNav />
      </div>
    </PhoneShell>
  );
}
