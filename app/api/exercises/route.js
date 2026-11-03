import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { requireOwner } from '../../../lib/auth.js';
import { isSameOrigin } from '../../../lib/policy.js';
import { exerciseInput } from '../../../lib/exercises.js';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','Vary':'Cookie'};
const fail=(error,status)=>Response.json({error},{status,headers});
export async function GET(){try{const auth=await requireOwner();if(auth.denied)return auth.denied;const sql=neon(process.env.DATABASE_URL);const rows=await sql`SELECT id,data,revision FROM training_knowledge.exercises ORDER BY id`;return Response.json({exercises:rows.map(r=>({...r.data,revision:r.revision}))},{headers});}catch{return fail('Øvelserne kunne ikke hentes.',503);}}
export async function POST(request){return write(request);}
async function write(request){
 try{
  if(!isSameOrigin(request.headers.get('origin'),process.env.PTDAHL_APP_ORIGIN))return fail('Anmodningen blev afvist.',403);
  const auth=await requireOwner();if(auth.denied)return auth.denied;
  const raw=await request.text();if(raw.length>16000)return fail('Øvelsen er for stor.',413);
  let body;try{body=JSON.parse(raw);}catch{return fail('Ugyldige data.',400);}
  if(!body||typeof body!=='object')return fail('Ugyldige data.',400);
  if(body.action==='add-machine-reference')return await addReference(body);
  const sql=neon(process.env.DATABASE_URL),existing={},id='X'+randomUUID().replaceAll('-','');
  let data;try{data={...exerciseInput(body,existing),id};}catch(e){return fail(e.message,400);}
  const rows=await sql`INSERT INTO training_knowledge.exercises (id,data,revision) VALUES (${id},${JSON.stringify(data)}::jsonb,1) RETURNING revision`;
  if(!rows.length)return fail('Øvelsen er ændret i en anden fane. Genindlæs banken først.',409);
  return Response.json({exercise:{...data,revision:rows[0].revision}},{status:201,headers});
 }catch{return fail('Øvelsen kunne ikke gemmes. Prøv igen.',503);}
}

async function addReference(body){
 const clean=k=>String(body[k]||'').trim().slice(0,150);
 if(typeof body.id!=='string'||!Number.isInteger(body.revision)||!clean('brand')||!clean('model'))return fail('Angiv øvelse, mærke, model og den aktuelle version.',400);
 const url=String(body.url||'').trim().slice(0,500);if(url){try{if(new URL(url).protocol!=='https:')throw Error();}catch{return fail('Kildelink skal bruge https.',400);}}
 const reference={brand:clean('brand'),series:clean('series'),model:clean('model'),url,match_status:'coach_recorded_verify_local_setup',checked_at:new Date().toISOString().slice(0,10)};
 const sql=neon(process.env.DATABASE_URL);
 const rows=await sql`UPDATE training_knowledge.exercises SET data=jsonb_set(data,'{machine_references}',COALESCE(data->'machine_references','[]'::jsonb)||${JSON.stringify([reference])}::jsonb),revision=revision+1 WHERE id=${body.id} AND revision=${body.revision} RETURNING data,revision`;
 if(!rows.length)return fail('Øvelsen er ændret i en anden fane. Genindlæs banken og prøv igen.',409);
 return Response.json({exercise:{...rows[0].data,revision:rows[0].revision}},{headers});
}
