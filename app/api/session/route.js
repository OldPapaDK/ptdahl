import { identity } from '../../../lib/auth.js';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return Response.json(await identity(), { headers: { 'Cache-Control': 'no-store', 'Vary': 'Cookie' } }); }
  catch { return Response.json({ error: 'Login kan ikke indlæses lige nu.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
