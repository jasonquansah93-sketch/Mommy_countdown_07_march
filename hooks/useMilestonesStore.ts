/**
 * SYSTEM MILESTONES STORE — Completely independent from moments.
 * Handles ONLY milestone data. Storage: SYSTEM_MILESTONES_{pregnancyId}
 * Milestones NEVER call addMoment, setMoments, or push to moments array.
 * When adding memory inside milestone: creates moment with origin "milestone" (stays in milestone only).
 */
import { usePregnancy } from '../context/PregnancyContext';

export function useMilestonesStore() {
  const { currentPregnancy, updateMilestoneWithMoment, getMomentsByMilestoneId, linkMomentToMilestone } =
    usePregnancy();

  return {
    milestones: currentPregnancy?.milestones ?? [],
    updateMilestoneWithMoment,
    getMomentsByMilestoneId,
    linkMomentToMilestone,
  };
}
