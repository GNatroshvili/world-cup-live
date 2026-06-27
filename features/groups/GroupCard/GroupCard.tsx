"use client";

import { motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useT } from "@/components/providers/I18nProvider";
import { StandingsTable } from "../StandingsTable/StandingsTable";
import type { Group } from "@/types";
import styles from "./GroupCard.module.scss";

interface Props {
  group: Group;
  index?: number;
}

export function GroupCard({ group, index = 0 }: Props) {
  const openGroup = useUIStore((s) => s.openGroup);
  const t = useT();
  const playedCount = group.matches.filter((m) => m.status === "finished").length;

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
    >
      <header className={styles.head}>
        <span className={styles.letter} aria-hidden>
          {group.id}
        </span>
        <div className={styles.headText}>
          <h3 className={styles.title}>{group.name}</h3>
          <p className={styles.meta}>
            {playedCount}/{group.matches.length} {t.group.played}
          </p>
        </div>
      </header>

      <div className={styles.tableWrap}>
        <StandingsTable standings={group.standings} variant="compact" />
      </div>

      <button
        type="button"
        className={styles.details}
        onClick={() => openGroup(group)}
      >
        {t.group.viewDetails}
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </motion.article>
  );
}
