// Pure fantasy scoring — compares a user's predictions to the real outcomes.
// Usable on the client; the server supplies the resolved `FantasyActuals`.
//
// Predictions cover the group winners and the winner of every knockout tie
// (Round of 32 → Final + Third-Place). The champion is whoever the user picks
// to win the Final, the finalists are their Semi-Final picks, and so on — so
// the bracket alone captures the full podium with no separate inputs.

import type { GroupId, KnockoutStage } from "@/types";

export type PickStatus = "correct" | "wrong" | "pending" | "none";
export type Side = "home" | "away";

export interface ResolvedPick {
  teamId: string | null;
  /** true once the real outcome is known (group complete). */
  decided: boolean;
}

/** A knockout fixture's real outcome (which side advanced), keyed by match id. */
export interface KnockoutActual {
  matchId: string;
  stage: KnockoutStage;
  winnerSide: Side | null;
  decided: boolean;
}

export interface FantasyActuals {
  groupWinners: Partial<Record<GroupId, ResolvedPick>>;
  knockout: KnockoutActual[];
}

export interface FantasyPredictions {
  groupWinners: Partial<Record<GroupId, string>>;
  knockoutWinners: Record<string, Side>;
}

export const POINTS = {
  group: 5,
} as const;

/** Points for correctly predicting a tie's winner, escalating by round. */
export const KNOCKOUT_POINTS: Record<KnockoutStage, number> = {
  r32: 5,
  r16: 8,
  qf: 12,
  sf: 18,
  third: 15,
  final: 40,
};

export const GROUP_IDS: GroupId[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

function groupStatusFor(
  pick: string | null | undefined,
  actual: ResolvedPick,
): PickStatus {
  if (!pick) return "none";
  if (!actual.decided) return "pending";
  return pick === actual.teamId ? "correct" : "wrong";
}

function sideStatusFor(
  pick: Side | undefined,
  actual: KnockoutActual,
): PickStatus {
  if (!pick) return "none";
  if (!actual.decided) return "pending";
  return pick === actual.winnerSide ? "correct" : "wrong";
}

export interface FantasyScore {
  earned: number;
  pending: number;
  /** total points available across every prediction in play */
  max: number;
  correctCount: number;
  groupStatus: Record<GroupId, PickStatus>;
  knockoutStatus: Record<string, PickStatus>;
}

export function scoreFantasy(
  predictions: FantasyPredictions,
  actuals: FantasyActuals,
): FantasyScore {
  let earned = 0;
  let pending = 0;
  let max = 0;
  let correctCount = 0;
  const groupStatus = {} as Record<GroupId, PickStatus>;
  const knockoutStatus: Record<string, PickStatus> = {};

  const tally = (status: PickStatus, points: number) => {
    max += points;
    if (status === "correct") {
      earned += points;
      correctCount += 1;
    } else if (status === "pending") {
      pending += points;
    }
  };

  for (const g of GROUP_IDS) {
    const actual = actuals.groupWinners[g] ?? { teamId: null, decided: false };
    const status = groupStatusFor(predictions.groupWinners[g], actual);
    groupStatus[g] = status;
    tally(status, POINTS.group);
  }

  for (const ko of actuals.knockout) {
    const status = sideStatusFor(predictions.knockoutWinners[ko.matchId], ko);
    knockoutStatus[ko.matchId] = status;
    tally(status, KNOCKOUT_POINTS[ko.stage]);
  }

  return { earned, pending, max, correctCount, groupStatus, knockoutStatus };
}
