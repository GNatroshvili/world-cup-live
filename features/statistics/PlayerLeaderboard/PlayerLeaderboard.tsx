import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { cn } from "@/utils/cn";
import type { PlayerStat } from "@/types";
import styles from "./PlayerLeaderboard.module.scss";

interface Props {
  title: string;
  players: PlayerStat[];
  accent?: "primary" | "gold" | "violet";
}

export function PlayerLeaderboard({ title, players, accent = "gold" }: Props) {
  return (
    <section className={cn(styles.card, styles[accent])}>
      <h3 className={styles.title}>{title}</h3>
      {players.length === 0 ? (
        <EmptyState
          title="No data yet"
          description="Scorers appear as matches are played."
        />
      ) : (
        <ol className={styles.list}>
          {players.map((p, i) => (
            <li key={`${p.player}-${p.team?.id ?? i}`} className={styles.row}>
              <span className={cn(styles.rank, i === 0 && styles.first)}>{i + 1}</span>
              {p.team && (
                <TeamBadge
                  name={p.team.name}
                  code={p.team.shortName}
                  badge={p.team.badge}
                  size="sm"
                />
              )}
              <span className={styles.name}>
                {p.player}
                <span className={styles.team}>{p.team?.name ?? ""}</span>
              </span>
              <span className={styles.value}>
                {p.value}
                <span className={styles.unit}>{p.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
