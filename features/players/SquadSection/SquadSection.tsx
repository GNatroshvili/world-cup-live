"use client";

import { PlayerCard } from "../PlayerCard/PlayerCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useT } from "@/components/providers/I18nProvider";
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
  const t = useT();

  if (squad.length === 0) {
    return (
      <EmptyState
        title={t.team.noSquad}
        description={t.team.noSquadDesc}
      />
    );
  }

  const labels: Record<PositionGroup, string> = {
    Goalkeepers: t.squad.goalkeepers,
    Defenders: t.squad.defenders,
    Midfielders: t.squad.midfielders,
    Forwards: t.squad.forwards,
    Squad: t.squad.squad,
  };

  const grouped = ORDER.map((group) => ({
    group,
    label: labels[group],
    players: squad.filter((p) => p.positionGroup === group),
  })).filter((g) => g.players.length > 0);

  return (
    <div className={styles.wrap}>
      {grouped.map(({ group, label, players }) => (
        <section key={group} className={styles.group}>
          <h3 className={styles.groupTitle}>
            {label}
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
