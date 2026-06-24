import { PlayerCard } from "../PlayerCard/PlayerCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import type { Player, PositionGroup } from "@/types";
import styles from "./SquadSection.module.scss";

interface Props {
  squad: Player[];
}

const ORDER: PositionGroup[] = [
  "Goalkeepers",
  "Defenders",
  "Midfielders",
  "Forwards",
  "Squad",
];

export function SquadSection({ squad }: Props) {
  if (squad.length === 0) {
    return (
      <EmptyState
        title="Squad not available"
        description="The squad list will appear here once published."
      />
    );
  }

  const grouped = ORDER.map((group) => ({
    group,
    players: squad.filter((p) => p.positionGroup === group),
  })).filter((g) => g.players.length > 0);

  return (
    <div className={styles.wrap}>
      {grouped.map(({ group, players }) => (
        <section key={group} className={styles.group}>
          <h3 className={styles.groupTitle}>
            {group}
            <span className={styles.count}>{players.length}</span>
          </h3>
          <div className={styles.grid}>
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
