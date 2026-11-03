import { isSameOrigin } from './policy.js';
import { listClients, deletionPlan } from './clients.js';
const headers = { 'Cache-Control': 'no-store', 'Vary': 'Cookie' };
const fail = (message, status) => Response.json({ error: message }, { status, headers });
async function read(sql, ownerId) {
  const [workspaces, accounts] = await Promise.all([
    sql`SELECT data, revision FROM ptdahl.workspaces WHERE owner_user_id = ${ownerId}`,
    // Read only public identity fields; writes to managed auth always use its API.
    sql`SELECT id, name, email, "emailVerified" FROM neon_auth.user`
  ]);
  return { workspace: workspaces[0] || { data: { version: 1, programs: [], answers: {}, places: [], workouts: {} }, revision: 0 }, accounts };
}
export function createClientHandlers({ requireOwner, connect, removeAccount, ownerEmail, appOrigin }) {
async function GET() {
  try {
    const auth = await requireOwner(); if (auth.denied) return auth.denied;
    const { workspace, accounts } = await read(connect(), auth.user.id);
    return Response.json({ clients: listClients(workspace.data, accounts, ownerEmail), revision: workspace.revision }, { headers });
  } catch { return fail('Klientoversigten kunne ikke hentes.', 503); }
}
async function DELETE(request) {
  try {
    if (!isSameOrigin(request.headers.get('origin'), appOrigin)) return fail('Anmodningen blev afvist.', 403);
    const auth = await requireOwner(); if (auth.denied) return auth.denied;
    const raw = await request.text(); if (raw.length > 2000) return fail('Ugyldig anmodning.', 413);
    let body; try { body = JSON.parse(raw); } catch { return fail('Ugyldig anmodning.', 400); }
    if (!body || typeof body !== 'object' || !Number.isInteger(body.revision) || body.revision < 0 || typeof body.key !== 'string' || body.confirm !== 'SLET') return fail('Bekræft sletningen ved at skrive SLET.', 400);
    const sql = connect();
    const { workspace, accounts } = await read(sql, auth.user.id);
    if (workspace.revision !== body.revision) return fail('Oplysningerne er ændret i en anden fane. Genindlæs siden før sletning.', 409);
    const plan = deletionPlan(workspace.data, body.key, accounts, { id: auth.user.id, email: ownerEmail });
    // Purge personal content atomically and advance the lease, so stale tabs cannot restore it.
    const updated = workspace.revision === 0
      ? await sql`INSERT INTO ptdahl.workspaces (owner_user_id, data, revision) VALUES (${auth.user.id}, ${JSON.stringify(plan.data)}::jsonb, 1) ON CONFLICT (owner_user_id) DO NOTHING RETURNING revision`
      : await sql`UPDATE ptdahl.workspaces SET data = ${JSON.stringify(plan.data)}::jsonb, revision = revision + 1, updated_at = now() WHERE owner_user_id = ${auth.user.id} AND revision = ${body.revision} RETURNING revision`;
    if (!updated.length) return fail('Arbejdsrummet er ændret. Genindlæs siden før sletning.', 409);
    if (plan.account) {
      try {
        const result = await removeAccount(plan.account.id);
        if (result.error) throw Error('AUTH_DELETE_FAILED');
        const remaining = await sql`SELECT id FROM neon_auth.user WHERE id = ${plan.account.id}`;
        if (remaining.length) throw Error('AUTH_DELETE_UNCONFIRMED');
      } catch {
        return Response.json({ error: 'Forløb og besvarelser er slettet, men loginprofilen kunne ikke slettes. Log ud og ind igen, og gentag sletningen fra Klienter.', partial: true, data: plan.data, revision: updated[0].revision }, { status: 502, headers });
      }
    }
    return Response.json({ deleted: true, removedPrograms: plan.removedPrograms, data: plan.data, revision: updated[0].revision }, { headers });
  } catch (error) { return fail(error.status ? error.message : 'Sletningen kunne ikke gennemføres. Genindlæs oversigten for at kontrollere resultatet.', error.status || 503); }
}

return { GET, DELETE };
}
