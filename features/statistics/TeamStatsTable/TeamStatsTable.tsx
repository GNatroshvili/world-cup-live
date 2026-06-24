import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import type { TeamStatRow } from "@/types";
import styles from "./TeamStatsTable.module.scss";

interface Props {
  rows: TeamStatRow[];
}

export function TeamStatsTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No team statistics yet"
        description="Per-team stats build up from match data as games are played."
      />
    );
  }
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.team}>Team</th>
            <th>P</th>
            <th>GF</th>
            <th>Shots</th>
            <th>On Target</th>
            <th>Poss %</th>
            <th>Passes</th>
            <th>Corners</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.team.id}>
              <td className={styles.team}>
                <TeamBadge
                  name={r.team.name}
                  code={r.team.shortName}
                  badge={r.team.badge}
                  size="xs"
                />
                <span className={styles.name}>{r.team.name}</span>
              </td>
              <td>{r.played}</td>
              <td className={styles.strong}>{r.goalsFor}</td>
              <td>{r.shots}</td>
              <td>{r.shotsOnTarget}</td>
              <td>{r.possession}</td>
              <td>{r.passes}</td>
              <td>{r.corners}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
