import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {available,alternatives,screenAnswers,makeDraft,canApprove,validateSession} from '../public/engine.js';
const ex=JSON.parse(readFileSync(new URL('../public/data/exercises.json',import.meta.url)));
const inv=['chair','wall','floor','dumbbells','bands','route','carry','bike','cable','legpress','row','step','bench'];
const answers={name:'Test',age:38,primary_goal:'HYROX',days_per_week:3,minutes:40,strength_history:'1 til 2 gange',run_ability:'Ja'};
test('rejects missing equipment and unknown equipment',()=>{assert.equal(available(ex.find(e=>e.id==='E041'),inv),false);assert.equal(available({...ex[0],required_equipment:['unknown']},inv),false);});
test('alternatives are available with explicit limitations',()=>{const a=alternatives('E041',ex,inv);assert(a.options.length>0);assert(a.limit.includes('friktion'));assert(a.options.every(e=>available(e,inv)));});
test('draft honours time and gear and does not guess kilos',()=>{for(const minutes of [15,20,30,45,60]){const p=makeDraft({...answers,minutes},ex,inv);assert.equal(p.weeks.length,12);for(const s of p.sessions){assert.deepEqual(validateSession(s,ex,inv),[]);assert(s.total_seconds<=minutes*60);assert(s.items.every(x=>x.load_kg===null));}assert.equal(p.status,'draft');assert.equal(canApprove(p),false);}});
test('blocking health text cannot approve until explicitly reviewed',()=>{const p=makeDraft({...answers,notes:'Ingen smerter i benene, men opereret ryg'},ex,inv);assert(p.flags.length>0);p.acknowledged=true;assert.equal(canApprove(p),false);p.flags.forEach(f=>f.resolved=true);assert.equal(canApprove(p),true);});
test('uncertainty, minors and running conflicts flag for clarification',()=>{assert(screenAnswers({...answers,current_symptoms:'Usikker'}).length);assert(screenAnswers({...answers,age:17}).length);assert(screenAnswers({...answers,run_ability:'Nej'}).length);});
test('no automatic load progression in later weeks',()=>{const p=makeDraft(answers,ex,inv);assert.deepEqual(p.weeks[0].session_ids,p.weeks[11].session_ids);assert(p.weeks.every(w=>w.progression.includes('Ingen automatisk')));});
test('no feasible exercises stops draft generation',()=>{assert.throws(()=>makeDraft({...answers,primary_goal:'Løb 5 km'},ex,[]),/ikke nok/);});
test('carry and sled blocks use time rather than repetitions',()=>{const p=makeDraft(answers,ex,[...inv,'sled','sandbag','wallball','ski']);for(const s of p.sessions)for(const x of s.items){const e=ex.find(e=>e.id===x.exercise_id);if(['carry','sled_push','sled_pull'].includes(e.movement_pattern)){assert(x.duration_min>0);assert.equal(x.reps,null);}}});
test('mobility draft does not turn into a general strength template',()=>{const p=makeDraft({...answers,primary_goal:'Mobilitet'},ex,inv);for(const s of p.sessions)for(const x of s.items)assert.equal(ex.find(e=>e.id===x.exercise_id).category,'mobilitet');});
test('public knowledge endpoint rejects writes before touching database',async()=>{
 const {default:handler}=await import('../api/knowledge.js');
 const response={headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.code=s;return this;},json(b){this.body=b;return this;}};
 await handler({method:'POST'},response);
 assert.equal(response.code,405);assert.equal(response.headers.Allow,'GET');
});
test('public knowledge endpoint fails closed without DATABASE_URL',async()=>{
 const saved=process.env.DATABASE_URL;delete process.env.DATABASE_URL;
 try{const {default:handler}=await import('../api/knowledge.js');
 const response={headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.code=s;return this;},json(b){this.body=b;return this;}};
 await handler({method:'GET'},response);assert.equal(response.code,503);assert.deepEqual(Object.keys(response.body),['error']);assert.equal(response.headers['Cache-Control'],'no-store');
 }finally{if(saved!==undefined)process.env.DATABASE_URL=saved;}
});
