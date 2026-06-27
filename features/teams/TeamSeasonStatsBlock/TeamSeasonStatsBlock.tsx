import { getTeamSeasonStats } from "@/lib/worldcup";
import { getServerT } from "@/lib/i18n/server";
import styles from "./TeamSeasonStatsBlock.module.scss";

interface Props {
  teamId: string;
}

export async function TeamSeasonStatsBlock({ teamId }: Props) {
  const [stats, t] = await Promise.all([getTeamSeasonStats(teamId), getServerT()]);
  if (!stats || stats.matches === 0) return null;

  const items = [
    { label: t.teamStats.avgPossession, value: `${stats.avgPossession}%` },
    { label: t.teamStats.totalShots, value: stats.totalShots },
    { label: t.teamStats.shotsOnTarget, value: stats.shotsOnTarget },
    { label: t.teamStats.passes, value: stats.totalPasses },
    { label: t.teamStats.passAccuracy, value: `${stats.passAccuracy}%` },
    { label: t.teamStats.corners, value: stats.corners },
  ];

  return (
    <section>
      <h2 className={styles.title}>
        {t.teamStats.performance} <span className={styles.sub}>· {stats.matches} matches</span>
      </h2>
      <div className={styles.grid}>
        {items.map((it) => (
          <div key={it.label} className={styles.card}>
            <span className={styles.value}>{it.value}</span>
            <span className={styles.label}>{it.label}</span>
          </div>
        ))}
      </div>

      {stats.perMatch.length > 0 && (
        <div className={styles.poss}>
          <span className={styles.possTitle}>{t.teamStats.possessionByMatch}</span>
          <div className={styles.possRows}>
            {stats.perMatch.map((m) => (
              <div key={m.matchId} className={styles.possRow}>
                <span className={styles.possOpp}>{m.opponent ?? "—"}</span>
                <div className={styles.possTrack}>
                  <span
                    className={styles.possFill}
                    style={{ width: `${m.possession ?? 0}%` }}
                  />
                </div>
                <span className={styles.possVal}>
                  {m.possession != null ? `${m.possession}%` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
