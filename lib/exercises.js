import { equipmentKeys } from '../public/equipment.js';
export const categories=['styrke','hyrox','kardio','loeb','mobilitet','balance'];
export function exerciseInput(input, existing={}) {
 const clean=(key,max=2000)=>String(input[key]??'').trim().slice(0,max);
 const required_equipment=input.required_equipment;
 if(!clean('name_da',120)||!clean('instruction_da')||!categories.includes(input.category)||!['begynder','let_oevet','oevet','avanceret'].includes(input.level)||!Array.isArray(required_equipment)||!required_equipment.length||required_equipment.some(k=>!Object.hasOwn(equipmentKeys,k))||required_equipment.includes('ingen')&&required_equipment.length>1)throw Error('Udfyld navn, instruktion, niveau, kategori og gyldigt udstyr. Uden udstyr kan ikke kombineres med andre valg.');
 const source_url=clean('source_url',500);if(source_url){try{if(new URL(source_url).protocol!=='https:')throw Error();}catch{throw Error('Kildelink skal være en gyldig https adresse.');}}
 if(!['needs_coach_review','coach_reviewed'].includes(input.review_status))throw Error('Vælg gennemgangsstatus.');
 return {...existing,name_da:clean('name_da',120),instruction_da:clean('instruction_da'),category:input.category,level:input.level,movement_pattern:clean('movement_pattern',60)||'unspecified',required_equipment:[...new Set(required_equipment)],source_url,source_ids:existing.source_ids||[],machine_brand:clean('machine_brand',100),machine_model:clean('machine_model',100),notes:clean('notes'),review_status:input.review_status,warmup_eligible:input.warmup_eligible===true,medical_clearance_claim:false,default_sets:null,default_reps:null,default_load_kg:null,media:existing.media||null,provenance:existing.provenance||'coach_authored_original'};
}
