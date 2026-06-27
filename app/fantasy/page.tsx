import type { Metadata } from "next";
import { getTournament } from "@/lib/worldcup";
import { getServerT } from "@/lib/i18n/server";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import { FantasyGame } from "@/features/fantasy/FantasyGame/FantasyGame";
import type {
  FantasyActuals,
  KnockoutActual,
  ResolvedPick,
} from "@/lib/fantasyScoring";
import type {
  BracketMatch,
  GroupId,
  KnockoutStage,
  TournamentData,
} from "@/types";

const PLAYOFF_STAGES: KnockoutStage[] = [
  "r32",
  "r16",
  "qf",
  "sf",
  "third",
  "final",
];

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fantasy Predictor",
  description:
    "Predict the World Cup 2026 — pick your group winners and the winner of every knockout tie through to the Final, and score points as the real results come in.",
};

function bracketWinnerSide(bm: BracketMatch): {
  winnerSide: "home" | "away" | null;
  decided: boolean;
} {
  if (
    bm.status !== "finished" ||
    bm.homeScore == null ||
    bm.awayScore == null
  ) {
    return { winnerSide: null, decided: false };
  }
  return {
    winnerSide: bm.homeScore > bm.awayScore ? "home" : "away",
    decided: true,
  };
}

function resolveActuals(data: TournamentData): FantasyActuals {
  const groupWinners: Partial<Record<GroupId, ResolvedPick>> = {};
  for (const g of data.groups) {
    const decided =
      g.matches.length > 0 && g.matches.every((m) => m.status === "finished");
    groupWinners[g.id] = {
      teamId: decided ? (g.standings[0]?.team.id ?? null) : null,
      decided,
    };
  }

  const knockout: KnockoutActual[] = data.bracket.rounds
    .filter((r) => PLAYOFF_STAGES.includes(r.stage))
    .flatMap((r) =>
      r.matches.map((bm) => ({
        matchId: bm.id,
        stage: r.stage,
        ...bracketWinnerSide(bm),
      })),
    );

  return { groupWinners, knockout };
}

export default async function FantasyPage() {
  const [{ data }, t] = await Promise.all([getTournament(), getServerT()]);

  const groups = data.groups.map((g) => ({
    id: g.id,
    name: g.name,
    teams: [...g.standings]
      .map((s) => s.team)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  const actuals = resolveActuals(data);

  const knockoutRounds = data.bracket.rounds
    .filter((r) => PLAYOFF_STAGES.includes(r.stage))
    .map((r) => ({
      stage: r.stage,
      title: r.title,
      matches: r.matches.map((bm) => ({
        matchId: bm.id,
        home: bm.home,
        away: bm.away,
        homeLabel: bm.homeLabel,
        awayLabel: bm.awayLabel,
      })),
    }));

  return (
    <PageContainer
      eyebrow={t.fantasy.pageEyebrow}
      title={t.fantasy.pageTitle}
      description={t.fantasy.pageDesc}
    >
      <FantasyGame
        groups={groups}
        knockoutRounds={knockoutRounds}
        actuals={actuals}
      />
    </PageContainer>
  );
}
