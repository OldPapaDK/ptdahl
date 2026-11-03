import { createNeonAuth } from '@neondatabase/auth/next/server';
import { isOwner } from './policy.js';
let instance;
export function getAuth() {
  if (!instance) {
    if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) throw new Error('AUTH_CONFIGURATION_MISSING');
    instance = createNeonAuth({ baseUrl: process.env.NEON_AUTH_BASE_URL, cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET } });
  }
  return instance;
}
export async function identity() {
  const { data } = await getAuth().getSession();
  const user = data?.user;
  if (!user) return { user: null, owner: false, verified: false };
  return { user: { id: user.id, name: user.name, email: user.email }, verified: user.emailVerified === true, owner: isOwner(user, process.env.PTDAHL_OWNER_EMAIL) };
}
export async function requireOwner() {
  const profile = await identity();
  if (!profile.user) return { denied: Response.json({ error: 'Log ind for at fortsætte.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } }) };
  if (!profile.owner) return { denied: Response.json({ error: 'Du har ikke adgang til dette arbejdsrum.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } }) };
  return { user: profile.user };
}
