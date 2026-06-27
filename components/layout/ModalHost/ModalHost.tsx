"use client";

import { useUIStore } from "@/store/uiStore";
import { GroupDetailsModal } from "@/features/groups/GroupDetailsModal/GroupDetailsModal";
import { MatchDetailsModal } from "@/features/matches/MatchDetailsModal/MatchDetailsModal";

export function ModalHost() {
  const { activeGroup, closeGroup, activeMatch, closeMatch } = useUIStore();
  return (
    <>
      <GroupDetailsModal group={activeGroup} onClose={closeGroup} />
      <MatchDetailsModal match={activeMatch} onClose={closeMatch} />
    </>
  );
}
