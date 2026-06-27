"use client";

import Link from "next/link";
import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { useT } from "@/components/providers/I18nProvider";
import { translateCountry } from "@/lib/i18n/translateData";
import type { Team } from "@/types";
import styles from "./TeamCard.module.scss";

interface Props {
  team: Team;
}

export function TeamCard({ team }: Props) {
  const t = useT();
  return (
    <Link href={`/team/${team.id}`} className={styles.card}>
      <span className={styles.glow} aria-hidden />
      <TeamBadge
        name={team.name}
        code={team.shortName}
        badge={team.badge}
        size="lg"
      />
      <span className={styles.name}>{team.name}</span>
      <span className={styles.country}>
        {translateCountry(team.country, t) ?? "—"}
      </span>
      {team.group && (
        <span className={styles.group}>
          {t.teams.group} {team.group}
        </span>
      )}
    </Link>
  );
}
