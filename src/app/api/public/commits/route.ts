import { NextResponse } from "next/server";

type Commit = { sha: string; message: string; date: string; url: string };

const FALLBACK: Commit[] = [
  {
    sha: "8ff523d",
    message: "feat: interactive BikeService landing, maps, and admin charts",
    date: "2026-08-28",
    url: "https://github.com/Himajori/Bike-Servicing-App/commit/8ff523d",
  },
  {
    sha: "8510269",
    message: "feat: notifications inbox and BikeService home/admin polish",
    date: "2026-08-27",
    url: "https://github.com/Himajori/Bike-Servicing-App/commit/8510269",
  },
  {
    sha: "a075bd1",
    message: "feat: inventory, notifications, and mechanic/admin APIs",
    date: "2026-08-27",
    url: "https://github.com/Himajori/Bike-Servicing-App/commit/a075bd1",
  },
  {
    sha: "cab50e7",
    message: "docs: add README with screenshots of the customer app",
    date: "2026-08-23",
    url: "https://github.com/Himajori/Bike-Servicing-App/commit/cab50e7",
  },
  {
    sha: "0d61cff",
    message: "feat: add customer frontend and Next.js app shell",
    date: "2026-08-23",
    url: "https://github.com/Himajori/Bike-Servicing-App/commit/0d61cff",
  },
];

export async function GET() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Himajori/Bike-Servicing-App/commits?per_page=8",
      { headers: { Accept: "application/vnd.github+json" }, next: { revalidate: 60 } },
    );
    if (!response.ok) return NextResponse.json({ commits: FALLBACK });
    const rows = (await response.json()) as {
      sha: string;
      html_url: string;
      commit: { message: string; author: { date: string } | null };
    }[];
    const commits: Commit[] = rows.map((row) => ({
      sha: row.sha.slice(0, 7),
      message: row.commit.message.split("\n")[0],
      date: (row.commit.author?.date ?? "").slice(0, 10),
      url: row.html_url,
    }));
    return NextResponse.json({ commits });
  } catch {
    return NextResponse.json({ commits: FALLBACK });
  }
}
