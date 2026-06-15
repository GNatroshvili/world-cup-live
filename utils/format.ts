import type { Match, MatchStatus } from "@/types";

// Matches are scheduled against the tournament calendar, so dates/times are
// rendered in a fixed timezone (UTC). Using the viewer's local timezone would
// shift the displayed calendar day (e.g. the Final drifting from 19 → 20 Jul).
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

export function formatLongDate(iso: string | null): string {
  if (!iso) return "Date to be confirmed";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "Date to be confirmed" : DATE_LONG_FMT.format(d);
}

export function formatTime(iso: string | null): string {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "--:--" : TIME_FMT.format(d);
}

/** Short kickoff descriptor used on cards, e.g. "Sat 14 Jun · 19:00". */
export function formatKickoff(iso: string | null): string {
  if (!iso) return "Schedule TBD";
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

/** "2 - 0" for played matches, "vs" otherwise. */
export function scoreline(match: Pick<Match, "homeScore" | "awayScore" | "status">): string {
  if (
    match.status === "finished" ||
    match.status === "live"
  ) {
    if (match.homeScore != null && match.awayScore != null) {
      return `${match.homeScore} - ${match.awayScore}`;
    }
  }
  return "vs";
}

/** Initials fallback when a team has no badge, e.g. "Ivory Coast" -> "IC". */
export function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
