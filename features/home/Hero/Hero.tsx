"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button/Button";
import type { Dict } from "@/lib/i18n/en";
import styles from "./Hero.module.scss";

interface Props {
  totals: {
    teams: number;
    matchesPlayed: number;
    goals: number;
  };
  t: Dict["hero"];
}

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

export function Hero({ totals, t }: Props) {
  const stats = [
    { label: t.nations, value: totals.teams || 48 },
    { label: t.matchesPlayed, value: totals.matchesPlayed },
    { label: t.goals, value: totals.goals },
    { label: t.hostCountries, value: 3 },
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.glow} aria-hidden />
      <div className="container">
        <motion.span
          className={styles.badge}
          variants={fade}
          custom={0}
          initial="hidden"
          animate="show"
        >
          {t.badge}
        </motion.span>

        <motion.h1
          className={styles.title}
          variants={fade}
          custom={1}
          initial="hidden"
          animate="show"
        >
          The <span className={styles.grad}>{t.titleAccent}</span>
          <br />
          {t.titleSuffix}
        </motion.h1>

        <motion.p
          className={styles.lead}
          variants={fade}
          custom={2}
          initial="hidden"
          animate="show"
        >
          {t.lead}
        </motion.p>

        <motion.div
          className={styles.actions}
          variants={fade}
          custom={3}
          initial="hidden"
          animate="show"
        >
          <Link href="#bracket">
            <Button size="lg">{t.viewBracket}</Button>
          </Link>
          <Link href="/matches">
            <Button size="lg" variant="outline">
              {t.matchCentre}
            </Button>
          </Link>
        </motion.div>

        <motion.dl
          className={styles.stats}
          variants={fade}
          custom={4}
          initial="hidden"
          animate="show"
        >
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <dt className={styles.statValue}>{s.value}</dt>
              <dd className={styles.statLabel}>{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
