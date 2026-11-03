import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeDemoWorkspace} from '../public/demo.js';
import {gear,available} from '../public/engine.js';
import {groundLocations} from '../public/ground.js';
import {exerciseInput} from '../lib/exercises.js';
const exercises=JSON.parse(readFileSync(new URL('../public/data/exercises.json',import.meta.url)));
const base={name_da:'Testøvelse',instruction_da:'Kontrolleret bevægelse.',category:'styrke',level:'begynder',required_equipment:['benstraekmaskine'],review_status:'needs_coach_review',source_url:'https://example.test/source'};
test('every exercise equipment requirement has a selectable matching inventory item',()=>{assert(exercises.every(e=>available(e,Object.keys(gear))));assert.equal(available(exercises.find(e=>e.id==='E013'),['legcurl']),true);});
test('machine-specific requirements cannot be satisfied by an unrelated machine',()=>{
 const e=exercises.find(e=>e.id==='E108');assert(available(e,['legextension']));assert(!available(e,['legpress']));
 const smith=exercises.find(e=>e.id==='E122');assert(!available(smith,['smith']));assert(available(smith,['smith','bench']));
});
test('Ground locations start separately with no assumed verified inventory',()=>{assert.equal(groundLocations.length,4);assert.equal(new Set(groundLocations.map(x=>x.id)).size,4);assert(groundLocations.every(x=>x.inventory.length===0));});
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
