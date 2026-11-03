import test from 'node:test';
import assert from 'node:assert/strict';
import { createClientHandlers } from '../lib/client-handlers.js';
const origin='https://ptdahl.vercel.app',owner={id:'owner-id',email:'owner@example.test'};
function fixture({denied,failAuth=false,competingWrite=false}={}) {
 let workspace={revision:5,data:{version:1,programs:[{id:'program',name:'Klient',answers:{email:'client@example.test'}}],answers:{},workouts:{'program:1:day':{}},places:[]}};
 let accounts=[{id:'client-id',email:'client@example.test',name:'Klient'},{...owner,name:'Ejer'}],removeCalls=0,writes=0;
 const sql=async(strings,...v)=>{
  const query=strings.join('?');
  if(query.startsWith('SELECT id,name,email FROM ptdahl.intake_requests'))return [];
  if(query.startsWith('SELECT data'))return [structuredClone(workspace)];
  if(query.startsWith('SELECT id, name'))return structuredClone(accounts);
  if(query.startsWith('SELECT id FROM'))return accounts.filter(a=>a.id===v[0]).map(a=>({id:a.id}));
  if((query.startsWith('UPDATE')||query.startsWith('WITH updated'))){if(competingWrite||workspace.revision!==v[2])return [];writes++;workspace={data:JSON.parse(v[0]),revision:workspace.revision+1};return [{revision:workspace.revision}];}
  throw Error('Unexpected query');
 };
 const handlers=createClientHandlers({requireOwner:async()=>denied?{denied:Response.json({error:'Denied'},{status:denied})}:{user:owner},connect:()=>sql,removeAccount:async id=>{removeCalls++;if(failAuth)return {error:{code:'FAIL'}};accounts=accounts.filter(a=>a.id!==id);return {data:{success:true}};},ownerEmail:owner.email,appOrigin:origin});
 const request=(body={},requestOrigin=origin)=>new Request(origin+'/api/clients',{method:'DELETE',headers:{Origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify({key:'email:client@example.test',confirm:'SLET',revision:5,...body})});
 return {handlers,request,get:()=>({workspace,accounts,removeCalls,writes})};
}
test('client routes deny unauthenticated and non-owner access without touching data',async()=>{
 for(const status of [401,403]){const f=fixture({denied:status});assert.equal((await f.handlers.GET()).status,status);assert.equal((await f.handlers.DELETE(f.request())).status,status);assert.equal(f.get().writes,0);assert.equal(f.get().removeCalls,0);}
});
test('foreign origin, missing confirmation, owner and stale revisions cannot delete',async()=>{
 const f=fixture();
 assert.equal((await f.handlers.DELETE(f.request({},'https://evil.test'))).status,403);
 assert.equal((await f.handlers.DELETE(f.request({confirm:''}))).status,400);
 assert.equal((await f.handlers.DELETE(f.request({key:`email:${owner.email}`}))).status,403);
 assert.equal((await f.handlers.DELETE(f.request({revision:4}))).status,409);
 assert.equal(f.get().writes,0);assert.equal(f.get().removeCalls,0);
});
test('a competing write prevents both content and auth deletion',async()=>{
 const f=fixture({competingWrite:true});assert.equal((await f.handlers.DELETE(f.request())).status,409);assert.equal(f.get().writes,0);assert.equal(f.get().removeCalls,0);
});
test('successful deletion advances revision, removes account and cannot be replayed from stale tab',async()=>{
 const f=fixture(),r=await f.handlers.DELETE(f.request()),body=await r.json();
 assert.equal(r.status,200);assert.equal(body.deleted,true);assert.equal(body.revision,6);assert.deepEqual(body.data.programs,[]);assert.deepEqual(body.data.workouts,{});
 assert.equal(f.get().accounts.length,1);assert.equal(f.get().removeCalls,1);
 assert.equal((await f.handlers.DELETE(f.request())).status,409);assert.equal(f.get().removeCalls,1);
});
test('auth failure reports partial deletion honestly and permits retry using new revision',async()=>{
 const f=fixture({failAuth:true}),r=await f.handlers.DELETE(f.request()),body=await r.json();
 assert.equal(r.status,502);assert.equal(body.partial,true);assert.equal(body.deleted,undefined);assert.deepEqual(body.data.programs,[]);assert.equal(body.revision,6);
 const listing=await (await f.handlers.GET()).json();assert.equal(listing.clients.find(c=>c.email==='client@example.test').account,true);
 assert.equal((await f.handlers.DELETE(f.request({revision:6}))).status,502);assert.equal(f.get().removeCalls,2);
});
