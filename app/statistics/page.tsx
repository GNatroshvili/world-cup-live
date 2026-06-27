import type { Metadata } from "next";
import { Suspense } from "react";
import { getTournament } from "@/lib/worldcup";
import { getServerT } from "@/lib/i18n/server";
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
  const [{ data }, t] = await Promise.all([getTournament(), getServerT()]);
  const s = data.statistics;

  const totals = [
    { label: t.statistics.totalTeams, value: s.totals.teams },
    { label: t.statistics.totalMatchesPlayed, value: s.totals.matchesPlayed },
    { label: t.statistics.totalGoals, value: s.totals.goals },
    { label: t.statistics.totalGoalsPerMatch, value: s.totals.averageGoalsPerMatch },
    { label: t.statistics.totalCleanSheets, value: s.totals.cleanSheets },
    { label: t.statistics.totalFixtures, value: s.totals.matchesScheduled },
  ];

  return (
    <PageContainer
      eyebrow={t.statistics.pageEyebrow}
      title={t.statistics.pageTitle}
      description={t.statistics.pageDesc}
      actions={<LiveStatus updatedAt={data.updatedAt} />}
    >
      <div className={styles.totals}>
        {totals.map((total) => (
          <div key={total.label} className={styles.totalCard}>
            <span className={styles.totalValue}>{total.value}</span>
            <span className={styles.totalLabel}>{total.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <Leaderboard title={t.statistics.mostGoals} leaders={s.mostGoals} accent="gold" />
        <Leaderboard title={t.statistics.mostWins} leaders={s.mostWins} accent="primary" />
        <Leaderboard
          title={t.statistics.bestGD}
          leaders={s.bestGoalDifference}
          accent="violet"
        />
        <Leaderboard title={t.statistics.mostCleanSheets} leaders={s.mostCleanSheets} accent="primary" />
        <Leaderboard title={t.statistics.mostPlayed} leaders={s.mostPlayed} accent="violet" />
      </div>

      <Suspense fallback={<DetailedStatsSkeleton />}>
        <DetailedStatsSections />
      </Suspense>

      <section className={styles.highest}>
        <h2 className={styles.sectionTitle}>{t.statistics.highestScoring}</h2>
        {s.highestScoringMatches.length > 0 ? (
          <div className={styles.matchGrid}>
            {s.highestScoringMatches.map((m) => (
              <MatchCard key={m.id} match={m} showGroup />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t.statistics.noMatches}
            description={t.statistics.noMatchesDesc}
          />
        )}
      </section>
    </PageContainer>
  );
}
