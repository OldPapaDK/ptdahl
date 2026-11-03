import {randomUUID,randomBytes} from 'node:crypto';
import {normalizeEmail} from './policy.js';
import {publishedSnapshot,tokenHash} from './sharing.js';
import {privateHeaders,accessFail} from './access-policy.js';
import {isSameOrigin} from './policy.js';
export function createInvitationHandlers({requireOwner,sqlClient,appOrigin,ownerEmail}){
 const sameOrigin=request=>isSameOrigin(request.headers.get('origin'),appOrigin);
async function GET(){try{const a=await requireOwner();if(a.denied)return a.denied;const sql=sqlClient();const invitations=await sql`SELECT id,program_id,email,expires_at,accepted_at,created_at FROM ptdahl.program_access WHERE owner_user_id=${a.user.id} ORDER BY created_at DESC`;return Response.json({invitations,emailDelivery:false},{headers:privateHeaders});}catch{return accessFail('Invitationerne kunne ikke hentes.',503);}}
async function POST(request){try{
 if(!sameOrigin(request))return accessFail('Anmodningen blev afvist.',403);const a=await requireOwner();if(a.denied)return a.denied;
 const body=await request.json();if(!Number.isInteger(body.revision)||typeof body.program_id!=='string')return accessFail('Ugyldige data.');
 const sql=sqlClient(),rows=await sql`SELECT data,revision FROM ptdahl.workspaces WHERE owner_user_id=${a.user.id}`;const workspace=rows[0];
 if(!workspace||workspace.revision!==body.revision)return accessFail('Gem ændringerne eller genindlæs siden før invitation.',409);
 const program=workspace.data.programs.find(p=>p.id===body.program_id),email=normalizeEmail(program?.answers?.email);
 if(!email||!email.includes('@')||email===normalizeEmail(ownerEmail))return accessFail('Forløbet skal have klientens egen mailadresse.');
 const bank=await sql`SELECT data FROM training_knowledge.exercises`;let snapshot;try{snapshot=publishedSnapshot(program,bank.map(r=>r.data));}catch(e){return accessFail(e.message);}
 const token=randomBytes(32).toString('base64url'),id=randomUUID();
 const saved=await sql`INSERT INTO ptdahl.program_access (id,owner_user_id,program_id,email,snapshot,token_hash,expires_at) SELECT ${id}::uuid,${a.user.id},${program.id},${email},${JSON.stringify(snapshot)}::jsonb,${tokenHash(token)},now()+interval '7 days' FROM ptdahl.workspaces WHERE owner_user_id=${a.user.id} AND revision=${body.revision} ON CONFLICT(owner_user_id,program_id,email) DO UPDATE SET snapshot=EXCLUDED.snapshot,token_hash=EXCLUDED.token_hash,expires_at=EXCLUDED.expires_at RETURNING id,accepted_at`;
 if(!saved.length)return accessFail('Arbejdsrummet er ændret. Genindlæs før invitation.',409);
 return Response.json({id:saved[0].id,email,accepted:Boolean(saved[0].accepted_at),url:saved[0].accepted_at?null:appOrigin+'/client#invite='+token,emailSent:false},{headers:privateHeaders});
 }catch{return accessFail('Invitationen kunne ikke oprettes.',503);}}
async function DELETE(request){try{if(!sameOrigin(request))return accessFail('Anmodningen blev afvist.',403);const a=await requireOwner();if(a.denied)return a.denied;const body=await request.json();if(typeof body.id!=='string')return accessFail('Ugyldig invitation.');const sql=sqlClient();await sql`DELETE FROM ptdahl.program_access WHERE id::text=${body.id} AND owner_user_id=${a.user.id}`;return Response.json({revoked:true},{headers:privateHeaders});}catch{return accessFail('Adgangen kunne ikke fjernes.',503);}}

 return {GET,POST,DELETE};
}
