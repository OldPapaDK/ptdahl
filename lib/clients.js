import { normalizeEmail } from './policy.js';

export const programEmail = p => normalizeEmail(p.answers?.email || p.email);
export const clientKey = p => programEmail(p) ? `email:${programEmail(p)}` : `program:${p.id}`;
export function listClients(data, accounts, ownerEmail) {
  const clients = new Map();
  for (const p of data?.programs || []) {
    const key = clientKey(p);
    if (!clients.has(key)) clients.set(key, { key, name: p.name, email: programEmail(p), programs: 0, approved: 0, account: false });
    const c = clients.get(key); c.programs++; if (p.status === 'approved') c.approved++;
  }
  // An unfinished questionnaire is still personal data and must be deletable.
  const draftEmail = normalizeEmail(data?.answers?.email);
  if (draftEmail) {
    const key = `email:${draftEmail}`;
    if (!clients.has(key)) clients.set(key, { key, name: data.answers.name || draftEmail, email: draftEmail, programs: 0, approved: 0, account: false });
    clients.get(key).unfinished = true;
  }
  for (const a of accounts) {
    const email = normalizeEmail(a.email), key = `email:${email}`;
    if (!clients.has(key)) clients.set(key, { key, name: a.name || email, email, programs: 0, approved: 0 });
    Object.assign(clients.get(key), { account: true, verified: a.emailVerified === true });
  }
  return [...clients.values()].map(c => ({ ...c, protected: c.email === normalizeEmail(ownerEmail) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'da'));
}
export function deletionPlan(data, key, accounts, owner) {
  const target = listClients(data, accounts, owner.email).find(c => c.key === key);
  if (!target) throw Object.assign(Error('Personen findes ikke længere. Genindlæs oversigten.'), { status: 404 });
  const account = accounts.find(a => normalizeEmail(a.email) === target.email);
  if (target.protected || account?.id === owner.id) throw Object.assign(Error('Ejerkontoen kan ikke slettes.'), { status: 403 });
  const next = structuredClone(data);
  const ids = new Set(next.programs.filter(p => clientKey(p) === key).map(p => p.id));
  next.programs = next.programs.filter(p => !ids.has(p.id));
  next.workouts = Object.fromEntries(Object.entries(next.workouts || {}).filter(([k]) => ![...ids].some(id => k.startsWith(`${id}:`))));
  if (target.email && normalizeEmail(next.answers?.email) === target.email) next.answers = {};
  return { data: next, target, account, deletedProgramIds:[...ids],removedPrograms: ids.size };
}
export function blockedAuthPath(path) {
  // Privileged mutations must use our scoped routes, including owner protection.
  return ['admin', 'delete-user', 'delete-user/callback', 'change-email'].some(p => path === p || path.startsWith(p + '/'));
}
