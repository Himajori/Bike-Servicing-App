"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { answerBikeService } from "@/lib/chat-knowledge";

type Msg = { role: "bot" | "user"; text: string };

const WELCOME: Msg = {
  role: "bot",
  text: "Hi — I'm the BikeService assistant. I only talk about this app. Ask how it works, how to book a repair, or how to buy or list a bike.",
};

export function AppChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [suggestions, setSuggestions] = useState(["How it works", "Book a repair", "Buy or sell a bike"]);
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || pending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await response.json()) as { text?: string; suggestions?: string[]; error?: string };
      const reply = data.text ? data : answerBikeService(text);
      setMessages((prev) => [...prev, { role: "bot", text: reply.text ?? "Try asking how it works." }]);
      if (reply.suggestions) setSuggestions(reply.suggestions);
    } catch {
      const fallback = answerBikeService(text);
      setMessages((prev) => [...prev, { role: "bot", text: fallback.text }]);
      setSuggestions(fallback.suggestions);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <section className="pointer-events-auto flex h-[min(32rem,70dvh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl">
          <header className="flex items-center justify-between bg-[oklch(0.22_0.03_50)] px-4 py-3 text-[oklch(0.97_0.01_80)]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-primary">BikeService</p>
              <h2 className="font-heading text-lg">Assistant</h2>
            </div>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)}>
              <X className="size-5" />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
            {messages.map((msg, index) => (
              <p
                key={`${msg.role}-${index}`}
                className={`whitespace-pre-wrap rounded-2xl px-3 py-2 ${
                  msg.role === "user" ? "ml-8 bg-primary/20" : "mr-8 bg-muted"
                }`}
              >
                {msg.text}
              </p>
            ))}
            {pending ? <p className="mr-8 rounded-2xl bg-muted px-3 py-2 text-muted-foreground">…</p> : null}
            <div ref={endRef} />
          </div>
          <div className="flex flex-wrap gap-1 border-t px-3 py-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full bg-muted px-2.5 py-1 text-xs hover:bg-accent"
                onClick={() => void ask(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about BikeService…"
              maxLength={500}
            />
            <Button type="submit" size="icon" disabled={pending || !input.trim()} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 transition hover:scale-105"
        aria-label={open ? "Close BikeService chat" : "Open BikeService chat"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-7" />}
      </button>
    </div>
  );
}
