"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { cn } from "@/utils/cn";
import type { Match, MatchDetail, MatchEventEntry, TeamMatchStats } from "@/types";
import styles from "./MatchDetailPanel.module.scss";

interface Props {
  match: Match;
}

const ICON: Record<MatchEventEntry["type"], string> = {
  goal: "⚽",
  penalty: "⚽",
  own: "⚽",
  yellow: "🟨",
  red: "🟥",
  sub: "🔁",
};

function eventLabel(e: MatchEventEntry): string {
  if (e.type === "penalty") return `${e.player} (pen.)`;
  if (e.type === "own") return `${e.player} (o.g.)`;
  if (e.type === "goal" && e.secondary) return `${e.player}`;
  return e.player;
}

const STAT_ROWS: { key: keyof TeamMatchStats; label: string; pct?: boolean }[] = [
  { key: "possession", label: "Possession", pct: true },
  { key: "shots", label: "Shots" },
  { key: "shotsOnTarget", label: "Shots on Target" },
  { key: "passes", label: "Passes" },
  { key: "passAccuracy", label: "Pass Accuracy", pct: true },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Fouls" },
];

function StatBar({
  label,
  home,
  away,
  pct,
}: {
  label: string;
  home: number | null;
  away: number | null;
  pct?: boolean;
}) {
  if (home == null && away == null) return null;
  const h = home ?? 0;
  const a = away ?? 0;
  const total = h + a || 1;
  const homePct = Math.round((h / total) * 100);
  return (
    <div className={styles.statRow}>
      <span className={cn(styles.statVal, h >= a && styles.statLead)}>
        {h}
        {pct ? "%" : ""}
      </span>
      <div className={styles.statMid}>
        <span className={styles.statLabel}>{label}</span>
        <div className={styles.statTrack}>
          <span className={styles.statFillHome} style={{ width: `${homePct}%` }} />
          <span className={styles.statFillAway} style={{ width: `${100 - homePct}%` }} />
        </div>
      </div>
      <span className={cn(styles.statVal, a > h && styles.statLead)}>
        {a}
        {pct ? "%" : ""}
      </span>
    </div>
  );
}

export function MatchDetailPanel({ match }: Props) {
  const played = match.status === "finished" || match.status === "live";
  // ESPN ids are numeric; seed/fallback ids aren't and have no summary.
  const fetchable = played && /^\d+$/.test(match.id);
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(fetchable);

  useEffect(() => {
    if (!fetchable) return;
    const controller = new AbortController();
    let active = true;
    fetch(`/api/match/${match.id}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MatchDetail | null) => {
        if (active) setDetail(d);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [match.id, fetchable]);

  if (!fetchable) return null;

  if (loading) {
    return (
      <div className={styles.panel}>
        <Skeleton width="35%" height="12px" />
        <Skeleton height="120px" />
        <Skeleton height="160px" />
      </div>
    );
  }

  if (!detail) return null;

  const goals = detail.events.filter(
    (e) => e.type === "goal" || e.type === "penalty" || e.type === "own",
  );
  const cards = detail.events.filter((e) => e.type === "yellow" || e.type === "red");
  const timeline = [...goals, ...cards].sort(
    (a, b) => parseInt(a.minute) - parseInt(b.minute),
  );

  const hasStats =
    detail.home.shots != null ||
    detail.home.possession != null ||
    detail.away.shots != null;

  return (
    <div className={styles.panel}>
      {timeline.length > 0 && (
        <section>
          <h3 className={styles.heading}>Match Events</h3>
          <ul className={styles.timeline}>
            {timeline.map((e, i) => (
              <li
                key={i}
                className={cn(
                  styles.event,
                  e.side === "away" ? styles.right : styles.left,
                )}
              >
                <span className={styles.eventBody}>
                  <span className={styles.icon}>{ICON[e.type]}</span>
                  <span className={styles.player}>
                    {eventLabel(e)}
                    {e.type === "goal" && e.secondary && (
                      <span className={styles.assist}>assist {e.secondary}</span>
                    )}
                  </span>
                </span>
                <span className={styles.minute}>{e.minute}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasStats && (
        <section>
          <h3 className={styles.heading}>Team Stats</h3>
          <div className={styles.stats}>
            {STAT_ROWS.map((row) => (
              <StatBar
                key={row.key}
                label={row.label}
                home={detail.home[row.key]}
                away={detail.away[row.key]}
                pct={row.pct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
