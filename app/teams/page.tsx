import type { Metadata } from "next";
import { getTournament } from "@/lib/worldcup";
import { GROUP_IDS } from "@/data/tournament";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import { TeamsExplorer } from "@/features/teams/TeamsExplorer/TeamsExplorer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Teams",
  description:
    "All 48 nations competing at the FIFA World Cup 2026. Browse by group or search by country.",
};

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { data } = await getTournament();

  return (
    <PageContainer
      eyebrow="Nations"
      title="Participating Teams"
      description="The 48 nations contesting the first 48-team World Cup, hosted across the USA, Canada and Mexico."
    >
      <TeamsExplorer teams={data.teams} groups={[...GROUP_IDS]} initialQuery={q ?? ""} />
    </PageContainer>
  );
}
