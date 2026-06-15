"use client";

import { Modal } from "@/components/ui/Modal/Modal";
import { StandingsTable } from "../StandingsTable/StandingsTable";
import { MatchCard } from "@/features/matches/MatchCard/MatchCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import type { Group } from "@/types";
import styles from "./GroupDetailsModal.module.scss";

interface Props {
  group: Group | null;
  onClose: () => void;
}

export function GroupDetailsModal({ group, onClose }: Props) {
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
                {group.standings.length} teams · {played?.length ?? 0} played ·{" "}
                {goals ?? 0} goals
              </p>
            </div>
          </header>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Standings</h3>
            <div className={styles.tableWrap}>
              <StandingsTable standings={group.standings} variant="full" />
            </div>
            <p className={styles.legend}>
              <span className={styles.legendDot} /> Top two advance to the
              knockout stage
            </p>
          </section>

          <div className={styles.cols}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Results</h3>
              {played && played.length > 0 ? (
                <div className={styles.matchList}>
                  {played.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No matches played yet"
                  description="Results will appear here as the group games kick off."
                />
              )}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Upcoming</h3>
              {upcoming && upcoming.length > 0 ? (
                <div className={styles.matchList}>
                  {upcoming.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              ) : (
                <EmptyState title="All group matches completed" />
              )}
            </section>
          </div>
        </div>
      )}
    </Modal>
  );
}
