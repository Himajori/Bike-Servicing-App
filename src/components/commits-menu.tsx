"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { api } from "@/lib/api";

type Commit = { sha: string; message: string; date: string; url: string };

export function CommitList({ commits }: { commits: Commit[] }) {
  return (
    <ul className="mt-6 divide-y rounded-2xl border bg-card">
      {commits.map((commit) => (
        <li key={commit.sha}>
          <a href={commit.url} target="_blank" rel="noreferrer" className="block px-4 py-3 hover:bg-muted">
            <p className="font-medium">{commit.message}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {commit.sha} · {commit.date}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function LandingCommits() {
  const [commits, setCommits] = useState<Commit[]>([]);
  useEffect(() => {
    api<{ commits: Commit[] }>("/api/public/commits")
      .then((d) => setCommits(d.commits))
      .catch(() => undefined);
  }, []);
  if (commits.length === 0) return <p className="mt-4 text-sm text-muted-foreground">Loading commits…</p>;
  return <CommitList commits={commits} />;
}

export function CommitsMenu() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api<{ commits: Commit[] }>("/api/public/commits")
      .then((d) => setCommits(d.commits))
      .catch(() => undefined);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-white/80 hover:text-primary"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Updates
        <ChevronDown className="size-3.5" />
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border bg-card p-2 text-foreground shadow-xl">
          <p className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">Last commits</p>
          <ul className="max-h-80 overflow-auto">
            {commits.map((commit) => (
              <li key={commit.sha}>
                <a
                  href={commit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl px-2 py-2 hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <p className="text-sm font-medium leading-snug">{commit.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {commit.sha} · {commit.date}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
