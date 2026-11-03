import {neon} from '@neondatabase/serverless';
import {identity} from './auth.js';
import {isSameOrigin} from './policy.js';
import {accessFail} from './access-policy.js';
export {privateHeaders,accessFail,accessible} from './access-policy.js';
export const sqlClient=()=>neon(process.env.DATABASE_URL);
export async function clientIdentity(){
 const p=await identity();if(!p.user||!p.verified)return {denied:accessFail('Log ind med en bekræftet mailadresse.',401)};
 const sql=sqlClient(),rows=await sql`SELECT id FROM neon_auth.user WHERE id=${p.user.id}`;
 if(!rows.length)return {denied:accessFail('Kontoen er ikke længere aktiv.',401)};
 return {user:{...p.user,verified:true}};
}
export function sameOrigin(request){return isSameOrigin(request.headers.get('origin'),process.env.PTDAHL_APP_ORIGIN);}
