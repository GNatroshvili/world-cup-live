import type { Metadata } from "next";
import { getTournament } from "@/lib/worldcup";
import { GROUP_IDS } from "@/data/tournament";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import { MatchesExplorer } from "@/features/matches/MatchesExplorer/MatchesExplorer";
import { OfflineBanner } from "@/components/ui/OfflineBanner/OfflineBanner";

export const revalidate = 300;

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
  const { status } = await searchParams;
  const initialStatus = VALID.includes(status as StatusFilter)
    ? (status as StatusFilter)
    : "all";

  const { data, fromFallback } = await getTournament();

  return (
    <PageContainer
      eyebrow="Match Centre"
      title="Fixtures & Results"
      description="Follow every tie across the group stage and knockout rounds. Filter by status or group and sort by date."
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
