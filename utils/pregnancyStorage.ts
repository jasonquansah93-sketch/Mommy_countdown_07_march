import { loadJSON, saveJSON } from './storage';
import { Moment, Milestone, PregnancyMeta } from '../types/pregnancy';

const KEY_META = 'mommy_pregnancies';
const KEY_MOMENTS = (pregnancyId: string) => `mommy_moments_${pregnancyId}`;
const KEY_MILESTONES = (pregnancyId: string) => `mommy_milestones_${pregnancyId}`;

export async function loadPregnancyMeta(): Promise<PregnancyMeta[] | null> {
  return loadJSON<PregnancyMeta[]>(KEY_META);
}

export async function savePregnancyMeta(meta: PregnancyMeta[]): Promise<void> {
  await saveJSON(KEY_META, meta);
}

export async function loadMoments(pregnancyId: string): Promise<Moment[] | null> {
  return loadJSON<Moment[]>(KEY_MOMENTS(pregnancyId));
}

export async function saveMoments(pregnancyId: string, moments: Moment[]): Promise<void> {
  await saveJSON(KEY_MOMENTS(pregnancyId), moments);
}

export async function loadMilestones(pregnancyId: string): Promise<Milestone[] | null> {
  return loadJSON<Milestone[]>(KEY_MILESTONES(pregnancyId));
}

export async function saveMilestones(pregnancyId: string, milestones: Milestone[]): Promise<void> {
  await saveJSON(KEY_MILESTONES(pregnancyId), milestones);
}
