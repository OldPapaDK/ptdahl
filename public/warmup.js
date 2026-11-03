import { available } from './equipment.js';
// These are reviewable templates, never an assessment of clinical suitability.
export function chooseWarmup(mainItems, exercises, inventory, needsReview) {
 if(needsReview)return [];
 const lower=mainItems.some(i=>['squat','hinge','single_leg','run','run_walk','cycle','sled_push','sled_pull'].includes(exercises.find(e=>e.id===i.exercise_id)?.movement_pattern));
 const pool=lower?['E153','E049','E010','E157','E156']:['E153','E157','E156','E090','E010'];
 return pool.map(id=>exercises.find(e=>e.id===id)).filter(e=>e?.warmup_eligible&&available(e,inventory)).slice(0,4).map((e,i)=>({exercise_id:e.id,duration_min:i===0?3:1}));
}
export function warmupMinutes(items){return items.reduce((n,x)=>n+Number(x.duration_min),0);}
