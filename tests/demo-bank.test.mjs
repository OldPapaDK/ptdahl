import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeDemoWorkspace} from '../public/demo.js';
import {gear,available} from '../public/engine.js';
import {exerciseInput} from '../lib/exercises.js';
const exercises=JSON.parse(readFileSync(new URL('../public/data/exercises.json',import.meta.url)));
const base={name_da:'Testøvelse',instruction_da:'Kontrolleret bevægelse.',category:'styrke',level:'begynder',required_equipment:['benstraekmaskine'],review_status:'needs_coach_review',source_url:'https://example.test/source'};
test('every exercise equipment requirement has a selectable matching inventory item',()=>{assert(exercises.every(e=>available(e,Object.keys(gear))));assert.equal(available(exercises.find(e=>e.id==='E013'),['legcurl']),true);});
test('machine-specific requirements cannot be satisfied by an unrelated machine',()=>{
 const e=exercises.find(e=>e.id==='E108');assert(available(e,['legextension']));assert(!available(e,['legpress']));
 const smith=exercises.find(e=>e.id==='E122');assert(!available(smith,['smith']));assert(available(smith,['smith','bench']));
});

test('demo starts with fictional approved and draft examples and resets independently',()=>{
 const a=makeDemoWorkspace(exercises),b=makeDemoWorkspace(exercises);assert.equal(a.programs.length,3);assert(a.programs.some(p=>p.status==='approved'));assert(a.programs.some(p=>p.status==='draft'));assert(a.programs.every(p=>p.answers.email.endsWith('@example.test')));
 a.programs.pop();a.places[0].inventory.length=0;a.workouts['demo']=true;assert.equal(b.programs.length,3);assert(b.places[0].inventory.length>0);assert.deepEqual(b.workouts,{});
});
test('new exercise cannot claim clinical clearance, prescribe default kilos or supply a chosen id',()=>{
 const e=exerciseInput({...base,id:'E001',medical_clearance_claim:true,default_load_kg:100,source_ids:['fake']});assert.equal(e.id,undefined);assert.equal(e.medical_clearance_claim,false);assert.equal(e.default_load_kg,null);assert.deepEqual(e.source_ids,[]);
});
test('unknown equipment, mixed no-equipment and unsafe source links are rejected',()=>{
 for(const required_equipment of [[],['mystery'],['ingen','benstraekmaskine']])assert.throws(()=>exerciseInput({...base,required_equipment}));
 for(const source_url of ['javascript:alert(1)','http://example.test','bad link'])assert.throws(()=>exerciseInput({...base,source_url}));
 assert.equal(exerciseInput(base).name_da,'Testøvelse');
});
test('producer references cover all requested brands without making exercise eligibility depend on brand',async()=>{
 const {brandsFor,machineSearchText}=await import('../public/machines.js');
 for(const brand of ['BH Fitness / MOVEMIA','Technogym','Life Fitness','Matrix Fitness'])assert(exercises.some(e=>brandsFor(e).includes(brand)));
 const press=exercises.find(e=>e.id==='E018');assert.equal(brandsFor(press).length,4);assert(machineSearchText(press).includes('M070'));
 assert.equal(available(press,['chestpress']),true);assert.equal(available(press,[]),false);
});
test('specific curl variants require their own machine configuration and retain individual instructions',()=>{
 const fly=exercises.find(e=>e.id==='E147');assert(!available(fly,['cable']));assert(available(fly,['cablepair']));
 const seated=exercises.find(e=>e.id==='E127'),prone=exercises.find(e=>e.id==='E128');
 assert(available(seated,['seatedlegcurl']));assert(!available(prone,['seatedlegcurl']));assert(available(prone,['pronelegcurl']));assert.notEqual(seated.instruction_da,prone.instruction_da);
 for(const e of exercises)for(const r of e.machine_references||[]){assert(r.url.startsWith('https://'));assert(r.source_id);assert.equal(r.match_status,'catalogue_movement_example_verify_local_setup');}
});
