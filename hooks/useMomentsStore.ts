/**
 * USER MOMENTS STORE — Completely independent from milestones.
 * Handles ONLY user-created moments. Storage: USER_MOMENTS_{pregnancyId}
 * ONLY + Add Moment button creates moments with origin "manual" (visible in Your Moments).
 */
import { useCallback } from 'react';
import { usePregnancy } from '../context/PregnancyContext';
import { Moment } from '../types/pregnancy';

export function useMomentsStore() {
  const { currentPregnancy, addMoment, getManualMoments, getMomentById, linkMomentToMilestone } = usePregnancy();

  const addManualMoment = useCallback(
    (moment: Omit<Moment, 'id' | 'type' | 'origin'>) => {
      addMoment(moment, 'manual');
    },
    [addMoment]
  );

  return {
    moments: currentPregnancy?.moments ?? [],
    manualMoments: getManualMoments(),
    addMoment: addManualMoment,
    getMomentById,
    linkMomentToMilestone,
  };
}
