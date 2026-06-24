"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/Modal/Modal";
import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { formatLongDate, formatTime, scoreline } from "@/utils/format";
import { MatchDetailPanel } from "@/features/matches/MatchDetailPanel/MatchDetailPanel";
import type { Match } from "@/types";
import styles from "./MatchDetailsModal.module.scss";

interface Props {
  match: Match | null;
  onClose: () => void;
}

function Side({ team, label }: { team: Match["home"]; label?: string }) {
  return (
    <div className={styles.side}>
      {team ? (
        <>
          <TeamBadge name={team.name} code={team.shortName} badge={team.badge} size="xl" />
          <span className={styles.sideName}>{team.name}</span>
          <span className={styles.sideCode}>{team.shortName}</span>
        </>
      ) : (
        <>
          <span className={styles.sideTbd} aria-hidden>
            ?
          </span>
          <span className={styles.sideName}>{label ?? "To be decided"}</span>
        </>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className={styles.detail}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

export function MatchDetailsModal({ match, onClose }: Props) {
  const played = match?.status === "finished" || match?.status === "live";

  return (
    <Modal open={Boolean(match)} onClose={onClose} size="md" label="Match details">
      {match && (
        <div className={styles.wrap}>
          {match.poster || match.thumb ? (
            <div className={styles.hero}>
              <Image
                src={(match.poster ?? match.thumb) as string}
                alt={`${match.home?.name ?? "Home"} vs ${match.away?.name ?? "Away"}`}
                fill
                className={styles.heroImg}
                sizes="(max-width: 600px) 100vw, 560px"
              />
              <div className={styles.heroFade} />
            </div>
          ) : null}

          <div className={styles.topRow}>
            <span className={styles.round}>
              {match.group ? `Group ${match.group} · ` : ""}
              {match.roundLabel}
            </span>
            <StatusBadge status={match.status} />
          </div>

          <div className={styles.scoreboard}>
            <Side team={match.home} label={match.homeLabel} />
            <div className={styles.center}>
              <span className={styles.score}>{scoreline(match)}</span>
              <span className={styles.kickoff}>
                {played ? formatTime(match.kickoff) : "Kick-off " + formatTime(match.kickoff)}
              </span>
            </div>
            <Side team={match.away} label={match.awayLabel} />
          </div>

          <div className={styles.details}>
            <Detail label="Date" value={formatLongDate(match.kickoff)} />
            <Detail label="Venue" value={match.venue} />
            {match.city && <Detail label="Location" value={match.city} />}
            <Detail label="Competition" value={match.league} />
            <Detail
              label="Stage"
              value={match.group ? `Group Stage · Group ${match.group}` : match.roundLabel}
            />
          </div>

          <MatchDetailPanel key={match.id} match={match} />
        </div>
      )}
    </Modal>
  );
}
