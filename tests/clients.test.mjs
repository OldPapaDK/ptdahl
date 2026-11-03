import test from 'node:test';
import assert from 'node:assert/strict';
import { listClients, deletionPlan, blockedAuthPath } from '../lib/clients.js';
const owner={id:'owner-id',email:'owner@example.test'};
const data={version:1,programs:[
 {id:'one',name:'Første',answers:{email:' Person@example.test '},status:'approved'},
 {id:'two',name:'Andet forløb',answers:{email:'person@example.test'},status:'draft'},
 {id:'other',name:'Anden person',answers:{email:'other@example.test'},status:'draft'},
 {id:'legacy',name:'Uden mail',status:'draft'}
],workouts:{'one:1:day1':{done:true},'two:2:day2':{},'other:1:day1':{},'one-more:1:day1':{}},answers:{name:'Første',email:'person@example.test',symptoms:'Privat'},places:[{id:'shared'}]};
const accounts=[{id:'person-id',email:'PERSON@example.test',name:'Første',emailVerified:true},{id:owner.id,email:owner.email,name:'Ejer',emailVerified:true}];
test('groups multiple programs by normalized email, including unfinished answers and login-only profiles',()=>{
 const rows=listClients(data,accounts,owner.email),person=rows.find(c=>c.email==='person@example.test');
 assert.equal(person.programs,2);assert.equal(person.approved,1);assert.equal(person.account,true);assert.equal(person.unfinished,true);
 assert.equal(rows.find(c=>c.email===owner.email).protected,true);
});
test('deletion purges all matching programs, their workouts and unfinished answers, preserving other people and shared places',()=>{
 const before=structuredClone(data),plan=deletionPlan(data,'email:person@example.test',accounts,owner);
 assert.deepEqual(plan.data.programs.map(p=>p.id),['other','legacy']);
 assert.deepEqual(Object.keys(plan.data.workouts),['other:1:day1','one-more:1:day1']);
 assert.deepEqual(plan.data.answers,{});assert.deepEqual(plan.data.places,data.places);
 assert.equal(plan.account.id,'person-id');assert.equal(plan.removedPrograms,2);assert.deepEqual(data,before);
});
test('owner cannot be deleted by email or identity even if identity email differs',()=>{
 assert.throws(()=>deletionPlan(data,`email:${owner.email}`,accounts,owner),e=>e.status===403);
 assert.throws(()=>deletionPlan(data,'email:person@example.test',[{...accounts[0],id:owner.id}],owner),e=>e.status===403);
});
test('a legacy program without email is deleted by its exact program key only',()=>{
 const plan=deletionPlan(data,'program:legacy',accounts,owner);
 assert.equal(plan.removedPrograms,1);assert.equal(plan.account,undefined);assert.equal(plan.data.programs.length,3);
 assert.equal(plan.data.answers.symptoms,'Privat');
});
test('unknown targets cannot trigger account removal',()=>{
 assert.throws(()=>deletionPlan(data,'email:missing@example.test',accounts,owner),e=>e.status===404);
});
test('raw auth admin and self-deletion paths cannot bypass the scoped client API',()=>{
 for(const path of ['admin/remove-user','admin/set-role','admin/list-users','delete-user','delete-user/callback','change-email'])assert.equal(blockedAuthPath(path),true);
 for(const path of ['sign-in/email','sign-up/email','get-session','email-otp/verify-email','sign-out'])assert.equal(blockedAuthPath(path),false);
});
