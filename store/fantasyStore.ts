import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GroupId } from "@/types";

interface FantasyState {
  name: string;
  groupWinners: Partial<Record<GroupId, string>>;
  knockoutWinners: Record<string, "home" | "away">;

  setName: (name: string) => void;
  setGroupWinner: (group: GroupId, teamId: string) => void;
  setKnockoutWinner: (matchId: string, side: "home" | "away") => void;
  reset: () => void;
}

const initial = {
  name: "",
  groupWinners: {} as Partial<Record<GroupId, string>>,
  knockoutWinners: {} as Record<string, "home" | "away">,
};

export const useFantasyStore = create<FantasyState>()(
  persist(
    (set) => ({
      ...initial,
      setName: (name) => set({ name }),
      setGroupWinner: (group, teamId) =>
        set((s) => ({ groupWinners: { ...s.groupWinners, [group]: teamId } })),
      setKnockoutWinner: (matchId, side) =>
        set((s) => ({ knockoutWinners: { ...s.knockoutWinners, [matchId]: side } })),
      reset: () => set({ ...initial, groupWinners: {}, knockoutWinners: {} }),
    }),
    {
      name: "wc26-fantasy",
      skipHydration: true,
    },
  ),
);
