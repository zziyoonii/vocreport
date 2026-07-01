const SPRINT_EPOCH = new Date('2025-10-13');
const SPRINT_LENGTH = 21;
const SPRINT_EPOCH_NO = 107;

export function currentSprintNo() {
  const diffMs = Date.now() - SPRINT_EPOCH.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return SPRINT_EPOCH_NO + Math.floor(diffDays / SPRINT_LENGTH);
}

export function sprintToDateRange(sprintNo) {
  const offsetDays = (sprintNo - SPRINT_EPOCH_NO) * SPRINT_LENGTH;
  const start = new Date(SPRINT_EPOCH);
  start.setDate(start.getDate() + offsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + SPRINT_LENGTH - 1);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

export const SERVICES = [
  { id: 'ide', label: '구름IDE' },
  { id: 'edu', label: '구름EDU' },
  { id: 'bootcamp', label: '구름Bootcamp' },
];
