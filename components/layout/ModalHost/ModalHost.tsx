"use client";

import { useUIStore } from "@/store/uiStore";
import { GroupDetailsModal } from "@/features/groups/GroupDetailsModal/GroupDetailsModal";
import { MatchDetailsModal } from "@/features/matches/MatchDetailsModal/MatchDetailsModal";

/** Renders the global group/match modals driven by the UI store. */
export function ModalHost() {
  const { activeGroup, closeGroup, activeMatch, closeMatch } = useUIStore();
  return (
    <>
      <GroupDetailsModal group={activeGroup} onClose={closeGroup} />
      <MatchDetailsModal match={activeMatch} onClose={closeMatch} />
    </>
  );
}
