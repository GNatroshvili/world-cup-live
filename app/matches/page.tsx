import type { Metadata } from "next";
import { getTournament } from "@/lib/worldcup";
import { getServerT } from "@/lib/i18n/server";
import { GROUP_IDS } from "@/data/tournament";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import { MatchesExplorer } from "@/features/matches/MatchesExplorer/MatchesExplorer";
import { OfflineBanner } from "@/components/ui/OfflineBanner/OfflineBanner";
import { LiveStatus } from "@/components/live/LiveStatus/LiveStatus";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Match Centre",
  description:
    "Every World Cup 2026 fixture — live, upcoming and completed. Filter by group, status and date.",
};

type StatusFilter = "all" | "live" | "upcoming" | "finished";

const VALID: StatusFilter[] = ["all", "live", "upcoming", "finished"];

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ status }, { data, fromFallback }, t] = await Promise.all([
    searchParams,
    getTournament(),
    getServerT(),
  ]);

  const initialStatus = VALID.includes(status as StatusFilter)
    ? (status as StatusFilter)
    : "all";

  return (
    <PageContainer
      eyebrow={t.matches.pageEyebrow}
      title={t.matches.pageTitle}
      description={t.matches.pageDesc}
      actions={<LiveStatus updatedAt={data.updatedAt} />}
    >
      {fromFallback && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <OfflineBanner />
        </div>
      )}
      <MatchesExplorer
        matches={data.matches}
        groups={[...GROUP_IDS]}
        initialStatus={initialStatus}
      />
    </PageContainer>
  );
}
