import { getTeamSeasonStats } from "@/lib/worldcup";
import styles from "./TeamSeasonStatsBlock.module.scss";

interface Props {
  teamId: string;
}

/** Team performance — average possession, shots, passing etc. across matches. */
export async function TeamSeasonStatsBlock({ teamId }: Props) {
  const stats = await getTeamSeasonStats(teamId);
  if (!stats || stats.matches === 0) return null;

  const items = [
    { label: "Avg Possession", value: `${stats.avgPossession}%` },
    { label: "Total Shots", value: stats.totalShots },
    { label: "Shots on Target", value: stats.shotsOnTarget },
    { label: "Passes", value: stats.totalPasses },
    { label: "Pass Accuracy", value: `${stats.passAccuracy}%` },
    { label: "Corners", value: stats.corners },
  ];

  return (
    <section>
      <h2 className={styles.title}>
        Performance <span className={styles.sub}>· {stats.matches} matches</span>
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
          <span className={styles.possTitle}>Possession by match</span>
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
