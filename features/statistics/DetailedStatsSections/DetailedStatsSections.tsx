import { getDetailedStats } from "@/lib/worldcup";
import { getServerT } from "@/lib/i18n/server";
import { PlayerLeaderboard } from "../PlayerLeaderboard/PlayerLeaderboard";
import { Leaderboard } from "../Leaderboard/Leaderboard";
import { TeamStatsTable } from "../TeamStatsTable/TeamStatsTable";
import styles from "./DetailedStatsSections.module.scss";

export async function DetailedStatsSections() {
  const [d, t] = await Promise.all([getDetailedStats(), getServerT()]);

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.detailedStats.playersSection}</h2>
        <div className={styles.duo}>
          <PlayerLeaderboard title={t.detailedStats.topScorers} players={d.topScorers} accent="gold" />
          <PlayerLeaderboard title={t.detailedStats.topAssists} players={d.topAssists} accent="primary" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.detailedStats.teamPerformance}</h2>
        <div className={styles.quad}>
          <Leaderboard title={t.detailedStats.mostShots} leaders={d.mostShots} accent="violet" />
          <Leaderboard title={t.detailedStats.mostShotsOnTarget} leaders={d.mostShotsOnTarget} accent="gold" />
          <Leaderboard title={t.detailedStats.mostPasses} leaders={d.mostPasses} accent="primary" />
          <Leaderboard title={t.detailedStats.bestPossession} leaders={d.bestPossession} unit="%" accent="violet" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.detailedStats.statsByTeam}</h2>
        <TeamStatsTable rows={d.teamStats} />
      </section>
    </>
  );
}
