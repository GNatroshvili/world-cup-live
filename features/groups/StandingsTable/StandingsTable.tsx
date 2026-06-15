import { cn } from "@/utils/cn";
import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { FormPills } from "@/components/ui/FormPills/FormPills";
import type { Standing } from "@/types";
import styles from "./StandingsTable.module.scss";

interface Props {
  standings: Standing[];
  /** "compact" hides per-result columns (used on cards). */
  variant?: "compact" | "full";
  /** highlight the top N qualification places. */
  qualifyCount?: number;
}

export function StandingsTable({
  standings,
  variant = "compact",
  qualifyCount = 2,
}: Props) {
  const full = variant === "full";
  return (
    <table className={cn(styles.table, full && styles.full)}>
      <thead>
        <tr>
          <th className={styles.pos}>#</th>
          <th className={styles.team}>Team</th>
          <th>P</th>
          {full && <th>W</th>}
          {full && <th>D</th>}
          {full && <th>L</th>}
          {full && <th>GF</th>}
          {full && <th>GA</th>}
          <th>GD</th>
          <th className={styles.pts}>Pts</th>
          {full && <th className={styles.form}>Form</th>}
        </tr>
      </thead>
      <tbody>
        {standings.map((s) => (
          <tr
            key={s.team.id}
            className={cn(s.position <= qualifyCount && styles.qualify)}
          >
            <td className={styles.pos}>
              <span className={styles.posMark}>{s.position}</span>
            </td>
            <td className={styles.team}>
              <TeamBadge
                name={s.team.name}
                code={s.team.shortName}
                badge={s.team.badge}
                size="xs"
              />
              <span className={styles.name}>{s.team.name}</span>
              <span className={styles.code}>{s.team.shortName}</span>
            </td>
            <td>{s.played}</td>
            {full && <td>{s.win}</td>}
            {full && <td>{s.draw}</td>}
            {full && <td>{s.loss}</td>}
            {full && <td>{s.goalsFor}</td>}
            {full && <td>{s.goalsAgainst}</td>}
            <td className={cn(s.goalDifference > 0 && styles.pos1, s.goalDifference < 0 && styles.neg)}>
              {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
            </td>
            <td className={styles.pts}>{s.points}</td>
            {full && (
              <td className={styles.form}>
                <FormPills form={s.form} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
