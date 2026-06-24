import type { Metadata } from "next";
import { getTournament } from "@/lib/worldcup";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import { Leaderboard } from "@/features/statistics/Leaderboard/Leaderboard";
import { MatchCard } from "@/features/matches/MatchCard/MatchCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { LiveStatus } from "@/components/live/LiveStatus/LiveStatus";
import styles from "./statistics.module.scss";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistics",
  description:
    "World Cup 2026 tournament statistics — top scorers, most wins, best defences and the highest-scoring matches, computed live from results.",
};

export default async function StatisticsPage() {
  const { data } = await getTournament();
  const s = data.statistics;

  const totals = [
    { label: "Teams", value: s.totals.teams },
    { label: "Matches Played", value: s.totals.matchesPlayed },
    { label: "Goals Scored", value: s.totals.goals },
    { label: "Goals / Match", value: s.totals.averageGoalsPerMatch },
    { label: "Clean Sheets", value: s.totals.cleanSheets },
    { label: "Fixtures", value: s.totals.matchesScheduled },
  ];

  return (
    <PageContainer
      eyebrow="By the Numbers"
      title="Tournament Statistics"
      description="Live leaderboards computed from match results. Figures grow as the tournament progresses."
      actions={<LiveStatus updatedAt={data.updatedAt} />}
    >
      <div className={styles.totals}>
        {totals.map((t) => (
          <div key={t.label} className={styles.totalCard}>
            <span className={styles.totalValue}>{t.value}</span>
            <span className={styles.totalLabel}>{t.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <Leaderboard title="Most Goals Scored" leaders={s.mostGoals} accent="gold" />
        <Leaderboard title="Most Wins" leaders={s.mostWins} accent="primary" />
        <Leaderboard
          title="Best Goal Difference"
          leaders={s.bestGoalDifference}
          accent="violet"
        />
        <Leaderboard title="Most Clean Sheets" leaders={s.mostCleanSheets} accent="primary" />
        <Leaderboard title="Most Matches Played" leaders={s.mostPlayed} accent="violet" />
      </div>

      <section className={styles.highest}>
        <h2 className={styles.sectionTitle}>Highest-Scoring Matches</h2>
        {s.highestScoringMatches.length > 0 ? (
          <div className={styles.matchGrid}>
            {s.highestScoringMatches.map((m) => (
              <MatchCard key={m.id} match={m} showGroup />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matches played yet"
            description="The goal-fest leaderboard will populate once games begin."
          />
        )}
      </section>
    </PageContainer>
  );
}
