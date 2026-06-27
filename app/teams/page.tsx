import type { Metadata } from "next";
import { getTournament } from "@/lib/worldcup";
import { getServerT } from "@/lib/i18n/server";
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
  const [{ q }, { data }, t] = await Promise.all([
    searchParams,
    getTournament(),
    getServerT(),
  ]);

  return (
    <PageContainer
      eyebrow={t.teams.pageEyebrow}
      title={t.teams.pageTitle}
      description={t.teams.pageDesc}
    >
      <TeamsExplorer teams={data.teams} groups={[...GROUP_IDS]} initialQuery={q ?? ""} />
    </PageContainer>
  );
}
