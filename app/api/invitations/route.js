import {requireOwner} from '../../../lib/auth.js';
import {sqlClient} from '../../../lib/access.js';
import {createInvitationHandlers} from '../../../lib/invitation-handlers.js';
export const dynamic='force-dynamic';
const handlers=()=>createInvitationHandlers({requireOwner,sqlClient,appOrigin:process.env.PTDAHL_APP_ORIGIN,ownerEmail:process.env.PTDAHL_OWNER_EMAIL});
export const GET=(request)=>handlers().GET(request);
export const POST=(request)=>handlers().POST(request);
export const DELETE=(request)=>handlers().DELETE(request);
