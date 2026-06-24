import { getDetailedStats } from "@/lib/worldcup";
import { PlayerLeaderboard } from "../PlayerLeaderboard/PlayerLeaderboard";
import { Leaderboard } from "../Leaderboard/Leaderboard";
import { TeamStatsTable } from "../TeamStatsTable/TeamStatsTable";
import styles from "./DetailedStatsSections.module.scss";

/**
 * Player + team leaderboards from per-match summaries. Rendered inside a
 * Suspense boundary so the rest of the statistics page isn't blocked on the
 * (heavier) summary aggregation.
 */
export async function DetailedStatsSections() {
  const d = await getDetailedStats();

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Players</h2>
        <div className={styles.duo}>
          <PlayerLeaderboard title="Top Scorers" players={d.topScorers} accent="gold" />
          <PlayerLeaderboard title="Top Assists" players={d.topAssists} accent="primary" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Team Performance</h2>
        <div className={styles.quad}>
          <Leaderboard title="Most Shots" leaders={d.mostShots} accent="violet" />
          <Leaderboard
            title="Most Shots on Target"
            leaders={d.mostShotsOnTarget}
            accent="gold"
          />
          <Leaderboard title="Most Passes" leaders={d.mostPasses} accent="primary" />
          <Leaderboard
            title="Best Possession"
            leaders={d.bestPossession}
            unit="%"
            accent="violet"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Statistics by Team</h2>
        <TeamStatsTable rows={d.teamStats} />
      </section>
    </>
  );
}
