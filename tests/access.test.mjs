import test from 'node:test';
import assert from 'node:assert/strict';
import { isOwner,isSameOrigin,validWorkspace } from '../lib/policy.js';
test('knowing the owners address never grants access without verified identity',()=>{
 assert.equal(isOwner({id:'one',email:'owner@example.test',emailVerified:false},'owner@example.test'),false);
 assert.equal(isOwner({email:'owner@example.test',emailVerified:true},'owner@example.test'),false);
 assert.equal(isOwner({id:'other',email:'other@example.test',emailVerified:true},'owner@example.test'),false);
 assert.equal(isOwner({id:'owner',email:'OWNER@example.test',emailVerified:true},'owner@example.test'),true);
 assert.equal(isOwner({id:'owner',email:'owner@example.test',emailVerified:true},''),false);
});
test('workspace writes reject unrelated origins and missing origin headers',()=>{
 assert.equal(isSameOrigin('https://ptdahl.vercel.app.evil.test','https://ptdahl.vercel.app'),false);
 assert.equal(isSameOrigin(null,'https://ptdahl.vercel.app'),false);
 assert.equal(isSameOrigin('https://ptdahl.vercel.app','https://ptdahl.vercel.app'),true);
});
test('malformed workspace shapes cannot be persisted',()=>{
 assert.equal(Boolean(validWorkspace({})),false);
 assert.equal(Boolean(validWorkspace({version:1,programs:[],places:[],answers:[],workouts:{}})),false);
 assert.equal(Boolean(validWorkspace({version:1,programs:[],places:[],answers:{},workouts:{}})),true);
});
