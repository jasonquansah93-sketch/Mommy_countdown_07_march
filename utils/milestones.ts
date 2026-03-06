import { Milestone } from '../types/pregnancy';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const MILESTONE_TEMPLATES: { daysBeforeDue: number; title: string }[] = [
  { daysBeforeDue: 200, title: '200 Days to Go' },
  { daysBeforeDue: 180, title: '180 Days to Go' },
  { daysBeforeDue: 150, title: '150 Days to Go' },
  { daysBeforeDue: 100, title: '100 Days to Go' },
  { daysBeforeDue: 75, title: '75 Days to Go' },
  { daysBeforeDue: 140, title: 'Halfway There! 🎉' },
  { daysBeforeDue: 50, title: '50 Days to Go' },
  { daysBeforeDue: 30, title: '30 Days to Go' },
  { daysBeforeDue: 21, title: '3 Weeks to Go' },
  // Final countdown milestones
  { daysBeforeDue: 10, title: '10 Days to Go' },
  { daysBeforeDue: 5, title: '5 Days to Go' },
  { daysBeforeDue: 3, title: '3 Days to Go' },
  { daysBeforeDue: 1, title: '1 Day to Go' },
  { daysBeforeDue: 0, title: 'Due Date 🎉' },
];

/** Only populates milestones[]. NEVER creates a Moment. NEVER touches moments[]. */
export function generateMilestones(dueDate: string): Milestone[] {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() + 6);
    return generateMilestones(fallback.toISOString());
  }

  return MILESTONE_TEMPLATES.map((tpl, index) => {
    const milestoneDate = addDays(due, -tpl.daysBeforeDue);
    return {
      type: 'milestone' as const,
      id: `milestone-${index}-${tpl.daysBeforeDue}`,
      title: tpl.title,
      milestoneDate: milestoneDate.toISOString(),
      linkedMomentIds: [],
    };
  }).sort((a, b) => new Date(a.milestoneDate).getTime() - new Date(b.milestoneDate).getTime());
}
