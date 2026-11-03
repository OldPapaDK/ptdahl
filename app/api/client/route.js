import {sqlClient,clientIdentity} from '../../../lib/access.js';
import {createPortalHandlers} from '../../../lib/portal-handlers.js';
export const dynamic='force-dynamic';
const handlers=()=>createPortalHandlers({sqlClient,clientIdentity,appOrigin:process.env.PTDAHL_APP_ORIGIN});
export const GET=(request)=>handlers().GET(request);
export const POST=(request)=>handlers().POST(request);
export const PUT=(request)=>handlers().PUT(request);
