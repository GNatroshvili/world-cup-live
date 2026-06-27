"use client";

import { Modal } from "@/components/ui/Modal/Modal";
import { StandingsTable } from "../StandingsTable/StandingsTable";
import { MatchCard } from "@/features/matches/MatchCard/MatchCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useT } from "@/components/providers/I18nProvider";
import type { Group } from "@/types";
import styles from "./GroupDetailsModal.module.scss";

interface Props {
  group: Group | null;
  onClose: () => void;
}

export function GroupDetailsModal({ group, onClose }: Props) {
  const t = useT();
  const played = group?.matches.filter(
    (m) => m.status === "finished" || m.status === "live",
  );
  const upcoming = group?.matches.filter(
    (m) => m.status === "scheduled" || m.status === "postponed",
  );

  const goals = played?.reduce(
    (sum, m) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0),
    0,
  );

  return (
    <Modal open={Boolean(group)} onClose={onClose} size="lg" label={group?.name}>
      {group && (
        <div className={styles.wrap}>
          <header className={styles.head}>
            <span className={styles.letter} aria-hidden>
              {group.id}
            </span>
            <div>
              <h2 className={styles.title}>{group.name}</h2>
              <p className={styles.sub}>
                {group.standings.length} {t.group.teams} · {played?.length ?? 0} {t.group.played} · {goals ?? 0} {t.group.goals}
              </p>
            </div>
          </header>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{t.group.standingsTitle}</h3>
            <div className={styles.tableWrap}>
              <StandingsTable standings={group.standings} variant="full" />
            </div>
            <p className={styles.legend}>
              <span className={styles.legendDot} /> {t.group.advanceNote}
            </p>
          </section>

          <div className={styles.cols}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>{t.group.resultsTitle}</h3>
              {played && played.length > 0 ? (
                <div className={styles.matchList}>
                  {played.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t.group.noMatchesYet}
                  description={t.group.noMatchesDesc}
                />
              )}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>{t.group.upcomingTitle}</h3>
              {upcoming && upcoming.length > 0 ? (
                <div className={styles.matchList}>
                  {upcoming.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              ) : (
                <EmptyState title={t.group.allCompleted} />
              )}
            </section>
          </div>
        </div>
      )}
    </Modal>
  );
}
