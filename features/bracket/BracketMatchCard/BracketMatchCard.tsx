"use client";

import { useUIStore } from "@/store/uiStore";
import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import type { BracketMatch, Match } from "@/types";
import styles from "./BracketMatchCard.module.scss";

interface Props {
  match: BracketMatch;
  roundTitle: string;
}

function bracketToMatch(bm: BracketMatch, roundTitle: string): Match {
  return {
    id: bm.id,
    stage: bm.stage,
    roundLabel: roundTitle,
    group: null,
    home: bm.home,
    away: bm.away,
    homeLabel: bm.homeLabel,
    awayLabel: bm.awayLabel,
    homeScore: bm.homeScore,
    awayScore: bm.awayScore,
    status: bm.status,
    kickoff: bm.kickoff,
    venue: bm.venue,
    city: null,
    league: "FIFA World Cup",
    leagueBadge: null,
    thumb: null,
    poster: null,
  };
}

function Row({
  team,
  label,
  score,
  winner,
}: {
  team: BracketMatch["home"];
  label: string;
  score: number | null;
  winner: boolean;
}) {
  return (
    <div className={cn(styles.row, winner && styles.winner)}>
      <span className={styles.rowTeam}>
        {team ? (
          <TeamBadge name={team.name} code={team.shortName} badge={team.badge} size="xs" />
        ) : (
          <span className={styles.dot} aria-hidden />
        )}
        <span className={styles.label}>{team ? team.shortName : label}</span>
      </span>
      <span className={styles.score}>{score ?? ""}</span>
    </div>
  );
}

export function BracketMatchCard({ match, roundTitle }: Props) {
  const openMatch = useUIStore((s) => s.openMatch);
  const decided = match.status === "finished";
  const homeWins = decided && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWins = decided && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => openMatch(bracketToMatch(match, roundTitle))}
      aria-label={`${roundTitle}: ${match.home?.name ?? match.homeLabel} vs ${
        match.away?.name ?? match.awayLabel
      }`}
    >
      <Row team={match.home} label={match.homeLabel} score={match.homeScore} winner={homeWins} />
      <span className={styles.divider} />
      <Row team={match.away} label={match.awayLabel} score={match.awayScore} winner={awayWins} />
      <span className={styles.date}>{formatDate(match.kickoff)}</span>
    </button>
  );
}
