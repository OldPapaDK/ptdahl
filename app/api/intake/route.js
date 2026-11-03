import {requireOwner} from '../../../lib/auth.js';
import {clientIdentity,sqlClient} from '../../../lib/access.js';
import {createIntakeHandlers} from '../../../lib/intake-handlers.js';
export const dynamic='force-dynamic';
const handlers=()=>createIntakeHandlers({requireOwner,clientIdentity,sqlClient,appOrigin:process.env.PTDAHL_APP_ORIGIN,ownerEmail:process.env.PTDAHL_OWNER_EMAIL});
export const GET=request=>handlers().GET(request);
export const PUT=request=>handlers().PUT(request);
export const POST=request=>handlers().POST(request);
