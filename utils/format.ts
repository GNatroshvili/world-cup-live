import type { Match, MatchStatus } from "@/types";

const TZ = "UTC";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: TZ,
});

const DATE_LONG_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
  timeZoneName: "short",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "TBD" : DATE_FMT.format(d);
}

export function formatLongDate(
  iso: string | null,
  fallback = "Date to be confirmed",
): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? fallback : DATE_LONG_FMT.format(d);
}

export function formatTime(iso: string | null): string {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "--:--" : TIME_FMT.format(d);
}

export function formatKickoff(
  iso: string | null,
  fallback = "Schedule TBD",
): string {
  if (!iso) return fallback;
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function statusLabel(status: MatchStatus): string {
  switch (status) {
    case "live":
      return "Live";
    case "finished":
      return "Full Time";
    case "postponed":
      return "Postponed";
    default:
      return "Upcoming";
  }
}

export function scoreline(
  match: Pick<Match, "homeScore" | "awayScore" | "status">,
): string {
  if (match.status === "finished" || match.status === "live") {
    if (match.homeScore != null && match.awayScore != null) {
      return `${match.homeScore} - ${match.awayScore}`;
    }
  }
  return "vs";
}

export function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
