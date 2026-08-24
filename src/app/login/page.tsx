import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { PhoneShell } from "@/components/phone-shell";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PhoneShell>
          <main className="px-5 py-10 text-sm text-muted-foreground">Loading…</main>
        </PhoneShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
