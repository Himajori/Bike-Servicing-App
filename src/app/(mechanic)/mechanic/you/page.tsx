"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NotificationInbox } from "@/components/notification-inbox";
import { api } from "@/lib/api";

export default function MechanicYouPage() {
  const router = useRouter();

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="px-5 pb-10 pt-8">
      <h1 className="font-heading text-3xl">You</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Mechanic alerts and session. Demo account: maya@rideready.test
      </p>
      <Button variant="outline" className="mt-4 w-full" onClick={() => void logout()}>
        Log out
      </Button>
      <section className="mt-8">
        <h2 className="font-medium">Alerts</h2>
        <div className="mt-3">
          <NotificationInbox />
        </div>
      </section>
    </main>
  );
}
