import type { Metadata } from "next";
import { Suspense } from "react";
import { getTournament } from "@/lib/worldcup";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import { Leaderboard } from "@/features/statistics/Leaderboard/Leaderboard";
import { DetailedStatsSections } from "@/features/statistics/DetailedStatsSections/DetailedStatsSections";
import { MatchCard } from "@/features/matches/MatchCard/MatchCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { LiveStatus } from "@/components/live/LiveStatus/LiveStatus";
import styles from "./statistics.module.scss";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistics",
  description:
    "World Cup 2026 statistics — top scorers, top assists, most shots, passing and possession leaders, per-team stats and the highest-scoring matches, all live.",
};

function DetailedStatsSkeleton() {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <Skeleton width="40%" height="14px" />
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} height="20px" />
          ))}
        </div>
      ))}
    </div>
  );
}

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

      <Suspense fallback={<DetailedStatsSkeleton />}>
        <DetailedStatsSections />
      </Suspense>

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
