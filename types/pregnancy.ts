/** origin: "manual" = created via + Add Moment button (shows in Your Moments). "milestone" = created inside milestone (stays in milestone only). */
export type MomentOrigin = 'manual' | 'milestone';

/** Moment: user-created memory. NEVER mixed with milestones. */
export interface Moment {
  id: string;
  type: 'moment';
  origin: MomentOrigin;
  title: string;
  note?: string;
  imageUri?: string | null;
  createdAt: string; // ISO
  linkedMilestoneId?: string;
}

/** Milestone: calculated pregnancy checkpoint. NEVER a moment. */
export interface Milestone {
  id: string;
  type: 'milestone';
  title: string;
  milestoneDate: string; // ISO
  linkedMomentIds: string[];
}

export interface PregnancyMeta {
  id: string;
  startDate: string;
  dueDate: string;
  status: 'active' | 'archived';
}

/** In-memory combined view - moments and milestones NEVER in same array */
export interface Pregnancy extends PregnancyMeta {
  moments: Moment[];
  milestones: Milestone[];
}

// Backward compatibility aliases
export type PregnancyMoment = Moment;
export type PregnancyMilestone = Milestone;
