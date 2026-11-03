import { blockedAuthPath } from '../../../../lib/clients.js';
import { getAuth } from '../../../../lib/auth.js';
const dispatch = method => async (request, context) => {
  try {
    const { path } = await context.params;
    if (blockedAuthPath(path.join('/'))) return Response.json({ error: 'Brug klientadministrationen til denne handling.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    return await getAuth().handler()[method](request, context); }
  catch { return Response.json({ error: 'Login er midlertidigt utilgængeligt.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
};
export const GET = dispatch('GET');
export const POST = dispatch('POST');
export const PUT = dispatch('PUT');
export const PATCH = dispatch('PATCH');
export const DELETE = dispatch('DELETE');
