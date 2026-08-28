"use client";

import { useEffect, useState } from "react";

export function RepairCounter({ value }: { value: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = Math.max(0, value - 240);
    const duration = 1400;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const digits = String(shown).padStart(6, "0").split("");

  return (
    <div className="text-center">
      <div className="flex items-end justify-center gap-1.5">
        {digits.map((digit, index) => (
          <span
            key={`${index}-${digit}`}
            className="inline-flex h-12 w-8 items-center justify-center rounded-md bg-black/35 font-heading text-2xl text-primary shadow-inner sm:h-14 sm:w-10 sm:text-3xl"
          >
            {digit}
          </span>
        ))}
        <span className="mb-1 ml-2 hidden text-3xl sm:inline" aria-hidden>
          🚲
        </span>
      </div>
      <p className="mt-2 text-sm text-white/70">Repairs done</p>
    </div>
  );
}
