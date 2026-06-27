"use client";

import { useUIStore } from "@/store/uiStore";
import { useT } from "@/components/providers/I18nProvider";
import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { cn } from "@/utils/cn";
import { formatKickoff, scoreline } from "@/utils/format";
import type { Match } from "@/types";
import styles from "./MatchCard.module.scss";

interface Props {
  match: Match;
  showGroup?: boolean;
}

function TeamSide({ match, side }: { match: Match; side: "home" | "away" }) {
  const team = side === "home" ? match.home : match.away;
  const label = side === "home" ? match.homeLabel : match.awayLabel;
  return (
    <div className={cn(styles.team, side === "away" && styles.away)}>
      {team ? (
        <>
          <TeamBadge name={team.name} code={team.shortName} badge={team.badge} size="sm" />
          <span className={styles.teamName}>{team.name}</span>
        </>
      ) : (
        <>
          <span className={styles.tbd} aria-hidden>?</span>
          <span className={styles.teamName}>{label ?? "TBD"}</span>
        </>
      )}
    </div>
  );
}

export function MatchCard({ match, showGroup }: Props) {
  const openMatch = useUIStore((s) => s.openMatch);
  const t = useT();
  const played = match.status === "finished" || match.status === "live";

  return (
    <button
      type="button"
      className={cn(styles.card, match.status === "live" && styles.live)}
      onClick={() => openMatch(match)}
    >
      <div className={styles.top}>
        <span className={styles.round}>
          {showGroup && match.group ? `${t.matches.groupLabel} ${match.group} · ` : ""}
          {match.roundLabel}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className={styles.fixture}>
        <TeamSide match={match} side="home" />
        <div className={cn(styles.score, played && styles.played)}>
          {scoreline(match)}
        </div>
        <TeamSide match={match} side="away" />
      </div>

      <div className={styles.foot}>
        <span>{formatKickoff(match.kickoff, t.status.scheduleTbd)}</span>
        {match.venue && <span className={styles.venue}>{match.venue}</span>}
      </div>
    </button>
  );
}
