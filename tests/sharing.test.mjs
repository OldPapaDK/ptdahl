import test from 'node:test';
import assert from 'node:assert/strict';
import {publishedSnapshot,tokenHash,canAccept,validProgress} from '../lib/sharing.js';
import {createInvitationHandlers} from '../lib/invitation-handlers.js';
import {createPortalHandlers} from '../lib/portal-handlers.js';
const origin='https://ptdahl.vercel.app';
const program={id:'p',version:1,status:'approved',acknowledged:true,flags:[],name:'Test',goal:'Styrke',answers:{email:'client@example.test',injuries:'private'},inventory:['private'],internal:'private',sessions:[{id:'day-0',title:'Styrke',warmup_items:[{exercise_id:'e',duration_min:1}],items:[{exercise_id:'e',sets:1,reps:6}],internal:'private'}],weeks:[{number:1,phase:'Start',progression:'Aftales'}]};
const bank=[{id:'e',name_da:'Testøvelse',instruction_da:'Roligt',private:'private'}];
const snapshot=publishedSnapshot(program,bank);
const req=(method,body={},requestOrigin=origin,url='/api/client')=>new Request(origin+url,{method,headers:{Origin:requestOrigin,'Content-Type':'application/json'},...(method!=='GET'?{body:JSON.stringify(body)}:{})});
test('only approved snapshots publish; intake and internal fields never reach client',()=>{
 assert.throws(()=>publishedSnapshot({...program,status:'draft'},bank));assert.throws(()=>publishedSnapshot({...program,flags:[{resolved:false}]},bank));assert.throws(()=>publishedSnapshot(program,[]));
 assert.ok(!JSON.stringify(snapshot).includes('private'));assert.notEqual(snapshot.snapshot_id,publishedSnapshot(program,bank).snapshot_id);
 program.sessions[0].items[0].sets=9;assert.equal(snapshot.program.sessions[0].items[0].sets,1);program.sessions[0].items[0].sets=1;
});
test('invitation requires exact verified recipient, unexpired token and no prior acceptance',()=>{
 const g={email:'client@example.test',expires_at:new Date(Date.now()+60000),token_hash:tokenHash('secret')},u={id:'c',email:g.email,verified:true};
 assert.ok(canAccept(g,u,tokenHash('secret')));
 for(const [grant,user,token] of [[g,{...u,email:'other@example.test'},g.token_hash],[g,{...u,verified:false},g.token_hash],[{...g,accepted_user_id:'c'},u,g.token_hash],[{...g,expires_at:'2000-01-01'},u,g.token_hash],[g,u,tokenHash('wrong')]])assert.equal(canAccept(grant,user,token),false);
});
test('progress rejects foreign days, invalid weeks, inconsistent completion and invalid loads',()=>{
 const good={'1:day-0':{index:0,warmup_index:1,done:false,logs:[]}};assert.equal(validProgress(good,snapshot),true);
 for(const d of [{'13:day-0':good['1:day-0']},{'1:foreign':good['1:day-0']},{'1:day-0:extra':good['1:day-0']},{'1:day-0':{...good['1:day-0'],index:3}},{'1:day-0':{...good['1:day-0'],done:true}},{'1:day-0':{...good['1:day-0'],logs:[{index:0,load_kg:-1}]}}])assert.equal(validProgress(d,snapshot),false);
});
test('invitation handlers deny nonowner and cross origin without database calls',async()=>{
 let calls=0;const factory=denied=>createInvitationHandlers({requireOwner:async()=>denied?{denied:Response.json({error:'Denied'},{status:403})}:{user:{id:'owner'}},sqlClient:()=>{calls++;throw Error();},appOrigin:origin});
 assert.equal((await factory(true).GET()).status,403);assert.equal((await factory(false).POST(req('POST',{},'https://evil.test'))).status,403);assert.equal(calls,0);
});
test('invitation stores hashed token, approved snapshot and no automatic mail claim',async()=>{
 let values;const sql=async(strings,...v)=>{const q=strings.join('?');if(q.startsWith('SELECT data,revision'))return [{revision:5,data:{programs:[program]}}];if(q.startsWith('SELECT data FROM'))return bank.map(data=>({data}));if(q.startsWith('INSERT')){values=v;return [{id:'access',accepted_at:null}];}throw Error(q);};
 const h=createInvitationHandlers({requireOwner:async()=>({user:{id:'owner'}}),sqlClient:()=>sql,appOrigin:origin,ownerEmail:'owner@example.test'});
 const stale=await h.POST(req('POST',{revision:4,program_id:'p'}));assert.equal(stale.status,409);
 const r=await h.POST(req('POST',{revision:5,program_id:'p'})),b=await r.json();assert.equal(r.status,200);assert.equal(b.emailSent,false);const token=b.url.split('invite=')[1];assert.ok(values.includes(tokenHash(token)));assert.ok(!values.includes(token));assert.ok(!values.find(v=>typeof v==='string'&&v.includes('private')));
});
test('client handlers reject anonymous access, used/foreign invitations, foreign programs and stale versions',async()=>{
 const anon=createPortalHandlers({clientIdentity:async()=>({denied:Response.json({},{status:401})}),sqlClient:()=>{throw Error('must not run');},appOrigin:origin});assert.equal((await anon.GET(req('GET'))).status,401);
 let grant=null,writes=0;const sql=async(strings,...v)=>{const q=strings.join('?');if(q.startsWith('UPDATE')){writes++;return [];}if(q.startsWith('SELECT a.id,a.snapshot'))return grant?[grant]:[];throw Error(q);};
 const h=createPortalHandlers({clientIdentity:async()=>({user:{id:'client',email:'client@example.test'}}),sqlClient:()=>sql,appOrigin:origin});
 assert.equal((await h.POST(req('POST',{token:'wrong'},'https://evil.test'))).status,403);assert.equal(writes,0);
 assert.equal((await h.POST(req('POST',{token:'wrong'}))).status,403);
 assert.equal((await h.GET(req('GET',{},origin,'/api/client?id=foreign'))).status,404);
 grant={id:'access',snapshot,progress:{},revision:2};assert.equal((await h.PUT(req('PUT',{id:'access',revision:2,snapshot_id:'old',data:{}}))).status,409);
 assert.equal((await h.PUT(req('PUT',{id:'access',revision:2,snapshot_id:snapshot.snapshot_id,data:{'13:day-0':{}}}))).status,400);
});
