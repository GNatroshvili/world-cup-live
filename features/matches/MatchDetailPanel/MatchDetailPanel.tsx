"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { useT } from "@/components/providers/I18nProvider";
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
        {h}{pct ? "%" : ""}
      </span>
      <div className={styles.statMid}>
        <span className={styles.statLabel}>{label}</span>
        <div className={styles.statTrack}>
          <span className={styles.statFillHome} style={{ width: `${homePct}%` }} />
          <span className={styles.statFillAway} style={{ width: `${100 - homePct}%` }} />
        </div>
      </div>
      <span className={cn(styles.statVal, a > h && styles.statLead)}>
        {a}{pct ? "%" : ""}
      </span>
    </div>
  );
}

export function MatchDetailPanel({ match }: Props) {
  const t = useT();
  const played = match.status === "finished" || match.status === "live";
  const fetchable = played && /^\d+$/.test(match.id);
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(fetchable);

  useEffect(() => {
    if (!fetchable) return;
    const source = axios.CancelToken.source();
    let active = true;
    axios
      .get<MatchDetail>(`/api/match/${match.id}`, { cancelToken: source.token })
      .then((res) => { if (active) setDetail(res.data); })
      .catch((err) => { if (!axios.isCancel(err)) console.warn("Match detail fetch failed", err); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; source.cancel(); };
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

  const statRows: { key: keyof TeamMatchStats; label: string; pct?: boolean }[] = [
    { key: "possession", label: t.matchDetail.possession, pct: true },
    { key: "shots", label: t.matchDetail.shots },
    { key: "shotsOnTarget", label: t.matchDetail.shotsOnTarget },
    { key: "passes", label: t.matchDetail.passes },
    { key: "passAccuracy", label: t.matchDetail.passAccuracy, pct: true },
    { key: "corners", label: t.matchDetail.corners },
    { key: "fouls", label: t.matchDetail.fouls },
  ];

  const goals = detail.events.filter(
    (e) => e.type === "goal" || e.type === "penalty" || e.type === "own",
  );
  const cards = detail.events.filter((e) => e.type === "yellow" || e.type === "red");
  const timeline = [...goals, ...cards].sort(
    (a, b) => parseInt(a.minute) - parseInt(b.minute),
  );

  const hasStats =
    detail.home.shots != null || detail.home.possession != null || detail.away.shots != null;

  return (
    <div className={styles.panel}>
      {timeline.length > 0 && (
        <section>
          <h3 className={styles.heading}>{t.matchDetail.matchEvents}</h3>
          <ul className={styles.timeline}>
            {timeline.map((e, i) => (
              <li
                key={i}
                className={cn(styles.event, e.side === "away" ? styles.right : styles.left)}
              >
                <span className={styles.eventBody}>
                  <span className={styles.icon}>{ICON[e.type]}</span>
                  <span className={styles.player}>
                    {eventLabel(e)}
                    {e.type === "goal" && e.secondary && (
                      <span className={styles.assist}>{t.matchDetail.assist} {e.secondary}</span>
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
          <h3 className={styles.heading}>{t.matchDetail.teamStats}</h3>
          <div className={styles.stats}>
            {statRows.map((row) => (
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
