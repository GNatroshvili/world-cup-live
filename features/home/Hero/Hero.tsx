"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button/Button";
import styles from "./Hero.module.scss";

interface Props {
  totals: {
    teams: number;
    matchesPlayed: number;
    goals: number;
  };
}

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

export function Hero({ totals }: Props) {
  const stats = [
    { label: "Nations", value: totals.teams || 48 },
    { label: "Matches Played", value: totals.matchesPlayed },
    { label: "Goals", value: totals.goals },
    { label: "Host Countries", value: 3 },
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
          United 2026 · USA · Canada · Mexico
        </motion.span>

        <motion.h1
          className={styles.title}
          variants={fade}
          custom={1}
          initial="hidden"
          animate="show"
        >
          The <span className={styles.grad}>FIFA World Cup</span>
          <br />
          Live Command Centre
        </motion.h1>

        <motion.p
          className={styles.lead}
          variants={fade}
          custom={2}
          initial="hidden"
          animate="show"
        >
          Group standings, live results, the complete knockout bracket and deep
          tournament statistics — all in one premium dashboard.
        </motion.p>

        <motion.div
          className={styles.actions}
          variants={fade}
          custom={3}
          initial="hidden"
          animate="show"
        >
          <Link href="#bracket">
            <Button size="lg">View the Bracket</Button>
          </Link>
          <Link href="/matches">
            <Button size="lg" variant="outline">
              Match Centre
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
