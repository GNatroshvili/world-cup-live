"use client";

import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useT } from "@/components/providers/I18nProvider";
import { translateCountry } from "@/lib/i18n/translateData";
import { cn } from "@/utils/cn";
import type { StatLeader } from "@/types";
import styles from "./Leaderboard.module.scss";

interface Props {
  title: string;
  unit?: string;
  leaders: StatLeader[];
  accent?: "primary" | "gold" | "violet";
}

export function Leaderboard({ title, unit, leaders, accent = "primary" }: Props) {
  const t = useT();
  return (
    <section className={cn(styles.card, styles[accent])}>
      <h3 className={styles.title}>{title}</h3>
      {leaders.length === 0 ? (
        <EmptyState title={t.detailedStats.noData} description={t.detailedStats.noDataDesc} />
      ) : (
        <ol className={styles.list}>
          {leaders.map((l, i) => (
            <li key={l.team.id} className={styles.row}>
              <span className={cn(styles.rank, i === 0 && styles.first)}>{i + 1}</span>
              <TeamBadge
                name={l.team.name}
                code={l.team.shortName}
                badge={l.team.badge}
                size="sm"
              />
              <span className={styles.name}>
                {translateCountry(l.team.name, t)}
                {l.detail && <span className={styles.detail}>{l.detail}</span>}
              </span>
              <span className={styles.value}>
                {l.value}
                {unit && <span className={styles.unit}>{unit}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
