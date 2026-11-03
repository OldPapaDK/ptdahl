import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeDraft,available,canApprove,validateSession} from '../public/engine.js';
import {warmupMinutes} from '../public/warmup.js';
const ex=JSON.parse(readFileSync(new URL('../public/data/exercises.json',import.meta.url)));
const inv=['floor','chair','wall','bands','dumbbells','route'];
const answers={name:'Test',age:38,primary_goal:'Bedre form',days_per_week:3,minutes:30,run_ability:'Ja'};
test('healthy drafts have concrete dynamic warmups inside the entire time budget',()=>{
 for(const minutes of [15,30,60])for(const s of makeDraft({...answers,minutes},ex,inv).sessions){assert(s.warmup_items.length>0);assert.equal(warmupMinutes(s.warmup_items),s.warmup_min);assert(s.warmup_items.every(x=>available(ex.find(e=>e.id===x.exercise_id),inv)));assert(!s.warmup_items.some(x=>x.exercise_id==='E048'));assert(s.total_seconds<=minutes*60);assert.deepEqual(validateSession(s,ex,inv),[]);}
});
test('health review flags leave warmup selection to the coach and block approval until filled',()=>{
 const p=makeDraft({...answers,notes:'Smerter i ryggen'},ex,inv);assert(p.sessions.every(s=>s.warmup_items.length===0));p.flags.forEach(f=>f.resolved=true);p.acknowledged=true;assert(!canApprove(p));p.sessions.forEach(s=>s.warmup_items=[{exercise_id:'E156',duration_min:s.warmup_min}]);assert(canApprove(p));
});
test('warmup validation rejects mismatched time and unavailable equipment',()=>{
 const s=structuredClone(makeDraft(answers,ex,inv).sessions[0]);s.warmup_items=[{exercise_id:'E158',duration_min:1}];assert(validateSession(s,ex,[]).length>0);assert(validateSession(s,ex,inv).some(x=>x.includes('tid stemmer')));
});
test('limited inventory does not introduce a support, a floor transfer or a machine',()=>{
 const p=makeDraft({...answers,primary_goal:'Mobilitet'},ex,['wall']);for(const s of p.sessions){assert(s.warmup_items.every(x=>available(ex.find(e=>e.id===x.exercise_id),['wall'])));assert(s.warmup_items.every(x=>!ex.find(e=>e.id===x.exercise_id).required_equipment.includes('maatte')));}
});
