// Global UI state (client). Holds search text, mobile-nav state, and the
// currently-open modal payloads so any component can open a group/match modal.
import { create } from "zustand";
import type { Group, Match } from "@/types";

interface UIState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  mobileNavOpen: boolean;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;

  activeGroup: Group | null;
  openGroup: (group: Group) => void;
  closeGroup: () => void;

  activeMatch: Match | null;
  openMatch: (match: Match) => void;
  closeMatch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  mobileNavOpen: false,
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  activeGroup: null,
  openGroup: (group) => set({ activeGroup: group }),
  closeGroup: () => set({ activeGroup: null }),

  activeMatch: null,
  openMatch: (match) => set({ activeMatch: match }),
  closeMatch: () => set({ activeMatch: null }),
}));
