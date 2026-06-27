"use client";

import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useT } from "@/components/providers/I18nProvider";
import type { TeamStatRow } from "@/types";
import styles from "./TeamStatsTable.module.scss";

interface Props {
  rows: TeamStatRow[];
}

export function TeamStatsTable({ rows }: Props) {
  const t = useT();

  if (rows.length === 0) {
    return (
      <EmptyState
        title={t.detailedStats.noTeamStats}
        description={t.detailedStats.noTeamStatsDesc}
      />
    );
  }
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.team}>{t.detailedStats.teamCol}</th>
            <th>P</th>
            <th>GF</th>
            <th>{t.detailedStats.shotsCol}</th>
            <th>{t.detailedStats.onTargetCol}</th>
            <th>{t.detailedStats.possCol}</th>
            <th>{t.detailedStats.passesCol}</th>
            <th>{t.detailedStats.cornersCol}</th>
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
