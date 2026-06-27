"use client";

import { useUIStore } from "@/store/uiStore";
import { useT } from "@/components/providers/I18nProvider";
import { translateRound, translateVenue, translateCountry } from "@/lib/i18n/translateData";
import type { Dict } from "@/lib/i18n/en";
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

function TeamSide({ match, side, t }: { match: Match; side: "home" | "away"; t: Dict }) {
  const team = side === "home" ? match.home : match.away;
  const label = side === "home" ? match.homeLabel : match.awayLabel;
  return (
    <div className={cn(styles.team, side === "away" && styles.away)}>
      {team ? (
        <>
          <TeamBadge
            name={team.name}
            code={team.shortName}
            badge={team.badge}
            size="sm"
          />
          <span className={styles.teamName}>{translateCountry(team.name, t)}</span>
        </>
      ) : (
        <>
          <span className={styles.tbd} aria-hidden>
            ?
          </span>
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
  const roundLabel = translateRound(match.roundLabel, t);

  return (
    <button
      type="button"
      className={cn(styles.card, match.status === "live" && styles.live)}
      onClick={() => openMatch(match)}
    >
      <div className={styles.top}>
        <span className={styles.round}>
          {showGroup && match.group
            ? `${t.matches.groupLabel} ${match.group} · `
            : ""}
          {roundLabel}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className={styles.fixture}>
        <TeamSide match={match} side="home" t={t} />
        <div className={cn(styles.score, played && styles.played)}>
          {scoreline(match)}
        </div>
        <TeamSide match={match} side="away" t={t} />
      </div>

      <div className={styles.foot}>
        <span>{formatKickoff(match.kickoff, t.status.scheduleTbd)}</span>
        {match.venue && (
          <span className={styles.venue}>{translateVenue(match.venue, t)}</span>
        )}
      </div>
    </button>
  );
}
