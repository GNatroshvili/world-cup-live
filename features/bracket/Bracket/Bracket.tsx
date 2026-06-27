"use client";

import { motion } from "framer-motion";
import { BracketMatchCard } from "../BracketMatchCard/BracketMatchCard";
import { useT } from "@/components/providers/I18nProvider";
import { translateRound } from "@/lib/i18n/translateData";
import { cn } from "@/utils/cn";
import type { Bracket as BracketType } from "@/types";
import styles from "./Bracket.module.scss";

interface Props {
  bracket: BracketType;
  className?: string;
}

export function Bracket({ bracket, className }: Props) {
  const t = useT();
  const treeRounds = bracket.rounds.filter((r) => r.stage !== "third");
  const thirdPlace = bracket.rounds.find((r) => r.stage === "third");

  return (
    <div className={cn(styles.scroller, className)}>
      <div className={styles.bracket}>
        {treeRounds.map((round) => {
          const title = translateRound(round.title, t);
          return (
            <div
              key={round.stage}
              className={cn(styles.round, styles[round.stage])}
            >
              <div className={styles.roundHead}>
                <span className={styles.roundTitle}>{title}</span>
                <span className={styles.roundCount}>
                  {round.matches.length}
                </span>
              </div>
              <div className={styles.matches}>
                {round.matches.map((m, i) => (
                  <motion.div
                    key={m.id}
                    className={styles.slot}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(i * 0.02, 0.2),
                    }}
                  >
                    <BracketMatchCard match={m} roundTitle={title} />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {thirdPlace &&
        (() => {
          const title = translateRound(thirdPlace.title, t);
          return (
            <div className={styles.third}>
              <div className={styles.roundHead}>
                <span className={styles.roundTitle}>{title}</span>
              </div>
              {thirdPlace.matches.map((m) => (
                <BracketMatchCard key={m.id} match={m} roundTitle={title} />
              ))}
            </div>
          );
        })()}
    </div>
  );
}
