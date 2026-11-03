import { neon } from '@neondatabase/serverless';
import { requireOwner } from '../../../lib/auth.js';
import { isSameOrigin, validWorkspace } from '../../../lib/policy.js';
const headers = { 'Cache-Control': 'no-store', 'Vary': 'Cookie' };
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const auth = await requireOwner(); if (auth.denied) return auth.denied;
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT data, revision FROM ptdahl.workspaces WHERE owner_user_id = ${auth.user.id}`;
    return Response.json(rows[0] || { data: null, revision: 0 }, { headers });
  } catch { return Response.json({ error: 'Arbejdsrummet kunne ikke hentes.' }, { status: 503, headers }); }
}
export async function PUT(request) {
  try {
    if (!isSameOrigin(request.headers.get('origin'), process.env.PTDAHL_APP_ORIGIN)) return Response.json({ error: 'Anmodningen blev afvist.' }, { status: 403, headers });
    const auth = await requireOwner(); if (auth.denied) return auth.denied;
    const reader = request.body?.getReader(); if (!reader) return Response.json({ error: 'Der mangler data.' }, { status: 400, headers });
    const chunks = []; let length = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > 1000000) { await reader.cancel(); return Response.json({ error: 'Arbejdsrummet er for stort til denne version.' }, { status: 413, headers }); } chunks.push(value); }
    const raw = Buffer.concat(chunks).toString('utf8'); let body;
    try { body = JSON.parse(raw); } catch { return Response.json({ error: 'Ugyldige data.' }, { status: 400, headers }); }
    if (!validWorkspace(body.data) || !Number.isInteger(body.revision) || body.revision < 0) return Response.json({ error: 'Ugyldige arbejdsrumsdata.' }, { status: 400, headers });
    const sql = neon(process.env.DATABASE_URL);
    // A single statement supplies a revision lease, including first-write concurrency.
    const rows = await sql`
      INSERT INTO ptdahl.workspaces (owner_user_id, data, revision)
      SELECT ${auth.user.id}, ${JSON.stringify(body.data)}::jsonb, 1 WHERE ${body.revision} = 0
      ON CONFLICT (owner_user_id) DO NOTHING RETURNING revision
    `;
    if (rows.length) return Response.json(rows[0], { headers });
    const updated = await sql`UPDATE ptdahl.workspaces SET data = ${JSON.stringify(body.data)}::jsonb, revision = revision + 1, updated_at = now() WHERE owner_user_id = ${auth.user.id} AND revision = ${body.revision} RETURNING revision`;
    if (!updated.length) return Response.json({ error: 'Arbejdsrummet er ændret i en anden fane. Genindlæs siden før flere rettelser.' }, { status: 409, headers });
    return Response.json(updated[0], { headers });
  } catch { return Response.json({ error: 'Ændringerne kunne ikke gemmes. Hold siden åben og prøv igen.' }, { status: 503, headers }); }
}
