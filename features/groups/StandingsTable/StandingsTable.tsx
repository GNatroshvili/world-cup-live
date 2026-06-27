"use client";

import { cn } from "@/utils/cn";
import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { FormPills } from "@/components/ui/FormPills/FormPills";
import { useT } from "@/components/providers/I18nProvider";
import { translateCountry } from "@/lib/i18n/translateData";
import type { Standing } from "@/types";
import styles from "./StandingsTable.module.scss";

interface Props {
  standings: Standing[];
  variant?: "compact" | "full";
  qualifyCount?: number;
}

export function StandingsTable({ standings, variant = "compact", qualifyCount = 2 }: Props) {
  const t = useT();
  const full = variant === "full";

  return (
    <table className={cn(styles.table, full && styles.full)}>
      <thead>
        <tr>
          <th className={styles.pos}>{t.standings.pos}</th>
          <th className={styles.team}>{t.standings.team}</th>
          <th>{t.standings.played}</th>
          {full && <th>{t.standings.won}</th>}
          {full && <th>{t.standings.drawn}</th>}
          {full && <th>{t.standings.lost}</th>}
          {full && <th>{t.standings.gf}</th>}
          {full && <th>{t.standings.ga}</th>}
          <th>{t.standings.gd}</th>
          <th className={styles.pts}>{t.standings.pts}</th>
          {full && <th className={styles.form}>{t.standings.form}</th>}
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
              <span className={styles.name}>{translateCountry(s.team.name, t)}</span>
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
