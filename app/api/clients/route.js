import { neon } from '@neondatabase/serverless';
import { getAuth, requireOwner } from '../../../lib/auth.js';
import { createClientHandlers } from '../../../lib/client-handlers.js';
export const dynamic = 'force-dynamic';
const handlers = () => createClientHandlers({
 requireOwner,
 connect: () => neon(process.env.DATABASE_URL),
 removeAccount: userId => getAuth().admin.removeUser({ userId }),
 ownerEmail: process.env.PTDAHL_OWNER_EMAIL,
 appOrigin: process.env.PTDAHL_APP_ORIGIN
});
export const GET = () => handlers().GET();
export const DELETE = request => handlers().DELETE(request);
