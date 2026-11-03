export const normalizeEmail = value => String(value || '').trim().toLowerCase();
export function isOwner(user, ownerEmail) {
  return Boolean(user?.id && user.emailVerified === true && normalizeEmail(ownerEmail) && normalizeEmail(user.email) === normalizeEmail(ownerEmail));
}
export function isSameOrigin(origin, appOrigin) {
  if (!origin || !appOrigin) return false;
  try { return new URL(origin).origin === new URL(appOrigin).origin; } catch { return false; }
}
export function validWorkspace(data) {
  return data && typeof data === 'object' && !Array.isArray(data) && data.version === 1 && Array.isArray(data.programs) && Array.isArray(data.places) && data.answers && typeof data.answers === 'object' && !Array.isArray(data.answers) && data.workouts && typeof data.workouts === 'object' && !Array.isArray(data.workouts);
}
