// Coaching draft engine. No diagnoses, auto-progression, known-safe claims or guessed kilos.
export const uuid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
export const gear = {
 none:'Uden udstyr',miniband:'Miniband',small_ball:'Lille træningsbold',high_anchor:'Højt godkendt elastikfæste',barbell:'Vægtstang og skiver',rack:'Rack til vægtstang',vest:'Vægtvest',plate:'Vægtskive',rowstation:'Sikkert stativ til kropsroning',dumbbells:'Håndvægte',kettlebell:'Kettlebell',bench:'Bænk',bands:'Elastik med sikkert fæste',cable:'Kabelmaskine',legpress:'Benpres',chestpress:'Brystpres',pulldown:'Pulldown',shoulderpress:'Skulderpres',bike:'Motionscykel',row:'Romaskine',ski:'SkiErg',sled:'Slæde og egnet bane',sandbag:'Sandbag',wallball:'Wall ball og sikkert mål',floor:'Måtte og gulvplads',step:'Stabilt lavt trin',route:'Sikker rute til gang eller løb',wall:'Væg',chair:'Stabil stol',carry:'Fri gangbane'
};
const equipmentKeys={miniband:['miniband'],lille_bold:['small_ball'],hoejt_sikkert_anker:['high_anchor'],vaegtstang:['barbell'],rack:['rack'],vaegtvest:['vest'],vaegtskive:['plate'],sikkert_roningsstativ:['rowstation'],ingen:[],stol:['chair'],vaeg:['wall'],maatte:['floor'],gulvplads:['floor'],fri_gulvplads:['floor'],hopbane:['floor'],stabil_stoette:['chair'],sikker_rute:['route'],haandvaegte:['dumbbells'],haandvaegt:['dumbbells'],kettlebell:['kettlebell'],to_vaegte:['dumbbells'],en_vaegt:['dumbbells'],baenk:['bench'],stabil_baenk:['bench'],elastik:['bands'],sikkert_anker:['bands'],kabelmaskine:['cable'],benpresmaskine:['legpress'],brystpresmaskine:['chestpress'],pulldownmaskine:['pulldown'],skulderpresmaskine:['shoulderpress'],laarcurlmaskine:['legcurl'],lav_step:['step'],gåbane:['carry'],slaede:['sled'],egnede_underlag:['sled'],tov:['sled'],sandbag:['sandbag'],wallball:['wallball'],sikkert_maal:['wallball'],motionscykel:['bike'],romaskine:['row'],skierg:['ski'],crosstrainer:['elliptical']};
export function available(ex,inventory){return ex.required_equipment.every(e=>(equipmentKeys[e]??['unavailable']).every(k=>inventory.includes(k)));}
export const substitutions=[
 {from:'E041',to:['E005','E004','E059','E060','E058','E061','E035'],purpose:'Benstyrke og arbejde med høj lokal belastning',limit:'Erstatter dele af benarbejdet. Træner ikke slædens kropsvinkel, friktion, greb eller specifikke teknik. Cykel er et konditionsalternativ, ikke en bevægelseserstatning.'},
 {from:'E042',to:['E020','E021','E064','E062','E063','E065','E007'],purpose:'Trækstyrke og benarbejde',limit:'Træk og benarbejde trænes hver for sig. Tovarbejde, greb og bevægelse med slæden kræver særskilt træning.'},
 {from:'E033',to:['E054','E034','E035','E055','E056','E057'],purpose:'Stavtagslignende bevægelse, kondition eller supplerende muskelarbejde',limit:'Elastiktræk ligner dele af bevægelsen, men modstand og måling er anderledes. Swing, tricepsstræk og cable crunch er kun supplerende øvelser. De er ikke ligeværdige SkiErg erstatninger. Ingen omregning af gentagelser til meter.'},
 {from:'E046',to:['E079','E080','E004','E003','E024','E081'],purpose:'Squatstyrke og pres over hovedet',limit:'Øvelserne træner dele af arbejdet hver for sig. Kast, modtagning, timing og konkurrencestandard trænes ikke.'},
 {from:'E044',to:['E043','E069','E070','E071','E072'],purpose:'Kontrolleret burpee arbejde',limit:'Mindre springbelastning og ingen fremadrettede hop. Ikke en fuld erstatning for burpee broad jumps.'},
 {from:'E045',to:['E075','E076','E077','E078','E007','E006'],purpose:'Ensidigt benarbejde',limit:'Anden belastningsplacering og eventuelt mindre samlet belastning. Sandbagteknik er ikke dækket.'}
];
export function alternatives(id,exercises,inventory){const rule=substitutions.find(r=>r.from===id);return rule?{...rule,options:rule.to.map(id=>exercises.find(e=>e.id===id)).filter(e=>e&&available(e,inventory))}:null;}
export function screenAnswers(a){const flags=[];if(a.review_with_coach==='Ja')flags.push({key:'review_with_coach',text:'Personen ønsker en samtale før programlægning.',blocking:true});
 for(const key of ['current_symptoms','exertional_symptoms','balance_limits']) if(a[key]&&a[key]!=='Nej') flags.push({key,text:'Helbredssvar kræver afklaring',blocking:true});
 for(const key of ['pain_location','pain_context','restrictions','operations','medical_conditions','medication_effects']) if(String(a[key]??'').trim()) flags.push({key,text:'Relevant helbredsoplysning skal gennemgås',blocking:true});
 if(a.pregnancy_postpartum&&a.pregnancy_postpartum!=='Nej'&&a.pregnancy_postpartum!=='Ønsker ikke at oplyse')flags.push({key:'pregnancy_postpartum',text:'Graviditet eller tiden efter fødsel skal afklares',blocking:true});
 if(a.floor_transfer&&a.floor_transfer!=='Ja') flags.push({key:'floor_transfer',text:'Adgang til gulvøvelser skal afklares',blocking:true});
 const notes=String(a.notes??'');
 // Intentionally conservative. Even negative phrasing is reviewed; never auto-clear free text.
 if(/smer|ondt|svimmel|besvim|operer|skæv|ryg|skade|bryst|åndenød|gravid/i.test(notes))flags.push({key:'notes',text:'Bemærkningen indeholder et helbredsord. Læs sammenhængen og spørg personen.',blocking:true});
 if((a.primary_goal??'').includes('HYROX')&&a.run_ability&&a.run_ability!=='Ja') flags.push({key:'run_ability',text:'HYROX mål og løbemulighed skal afklares',blocking:true});
 if(a.age&&Number(a.age)<18)flags.push({key:'age',text:'Demoens programskabeloner er kun til voksne',blocking:true});
 return flags;
}
const strengthA=['E003','E015','E021','E009','E014'];
const strengthB=['E008','E016','E020','E010','E027'];
const hyrox=['E033','E041','E042','E031','E045','E046'];
export function estimateSeconds(item){if(item.duration_min)return item.duration_min*60;return item.sets*((item.reps??8)*4*(item.per_side?2:1))+(item.sets-1)*item.rest_sec+45;}
export function validateSession(session,exercises,inventory){const errors=[];if(!session.items.length)errors.push('Der mangler øvelser.');for(const item of session.items){const e=exercises.find(e=>e.id===item.exercise_id);if(!e||!available(e,inventory))errors.push('Udstyr mangler til '+(e?.name_da??item.exercise_id));}if(session.total_seconds>session.budget_min*60)errors.push('Træningstiden overstiger den aftalte tid.');return errors;}
export function makeDraft(a,exercises,inventory){
 const goal=a.primary_goal||'Bedre form';const days=Math.max(1,Math.min(6,Number(a.days_per_week)||3));const minutes=Number(a.minutes)||40;
 if(minutes<15||minutes>120)throw Error('Vælg mellem 15 og 120 minutter i denne demo.');
 const beginner=!a.strength_history||['Ingen','Under en gang ugentligt'].includes(a.strength_history);const sessions=[];
 for(let day=0;day<days;day++){
  const isCardio=goal.includes('km')?day%3!==1:goal==='HYROX'?day%3===2:day%3===2;
  const pool=goal==='Mobilitet'?['E047','E048','E049','E050']:goal==='Hverdagsfunktion'?['E001','E014','E051','E052','E053']:isCardio?['E038','E037','E035','E034']:goal==='HYROX'&&day%3===1?hyrox:day%2?strengthB:strengthA;
  const picked=[];const substitutionsUsed=[];
  for(const id of pool){let e=exercises.find(e=>e.id===id);if(!e)continue;
   if((e.category==='loeb')&&a.run_ability!=='Ja')continue;
   if(!available(e,inventory)){const alt=alternatives(id,exercises,inventory);if(alt?.options.length){e=alt.options[0];substitutionsUsed.push({from:id,to:e.id,purpose:alt.purpose,limit:alt.limit});}else continue;}
   if(!picked.some(x=>x.id===e.id))picked.push(e);
  }
  if(!picked.length)throw Error('Der er ikke nok egnede øvelser med det valgte udstyr. Tilpas sted eller vælg øvelser manuelt.');
  const warmup=5;let remaining=minutes*60-warmup*60;const items=[];
  for(const e of picked){const endurance=['kardio','loeb'].includes(e.category)||e.movement_pattern==='erg';let item;
   if(e.category==='mobilitet'||e.category==='balance'){item={exercise_id:e.id,duration_min:2,sets:null,reps:null,rest_sec:0,load_kg:null,effort:'Rolige bevægelser med passende støtte. Omfang og bevægeudslag aftales med træneren.'};}
   else if(endurance){item={exercise_id:e.id,duration_min:isCardio?Math.min(25,Math.floor(remaining/60)):5,sets:null,reps:null,rest_sec:0,load_kg:null,effort:'Roligt tempo. Du skal kunne tale i hele sætninger.'};if(item.duration_min<3)continue;}
   else if(['carry','sled_push','sled_pull'].includes(e.movement_pattern))item={exercise_id:e.id,duration_min:2,sets:null,reps:null,rest_sec:0,load_kg:null,effort:'Kontrolleret teknik i korte arbejdsperioder med pauser efter behov. Belastning aftales med træneren.'};
   else item={exercise_id:e.id,sets:beginner?1:2,reps:e.movement_pattern==='single_leg'?6:e.movement_pattern==='calf'?12:e.movement_pattern==='core'?6:e.movement_pattern==='horizontal_push'?6:8,per_side:['single_leg','core'].includes(e.movement_pattern),rest_sec:75,load_kg:null,effort:'Find belastningen sammen med træneren. Ingen startvægt er fastsat.'};
   const sec=estimateSeconds(item);if(sec<=remaining){items.push(item);remaining-=sec;}
   if(isCardio&&items.length)break;
  }
  const total_seconds=warmup*60+items.reduce((s,x)=>s+estimateSeconds(x),0);
  const session={id:'day-'+day,title:goal==='Mobilitet'?'Mobilitet og ro':goal==='Hverdagsfunktion'?'Bevægelse i hverdagen':isCardio?'Kondition og overskud':goal==='HYROX'&&day%3===1?'HYROX byggesten':day%2?'Styrke · B':'Styrke · A',warmup_min:warmup,items,budget_min:minutes,total_seconds,substitutions:substitutionsUsed.filter(s=>items.some(x=>x.exercise_id===s.to))};
  const errs=validateSession(session,exercises,inventory);if(errs.length)throw Error(errs.join(' '));sessions.push(session);
 }
 return {id:uuid(),version:1,status:'draft',name:a.name||'Ny demoperson',goal,days,minutes,inventory:[...inventory],created_at:new Date().toISOString(),flags:screenAnswers(a),sessions,weeks:Array.from({length:12},(_,i)=>({number:i+1,phase:i<4?'Fundament':i<8?'Opfølgning':'Konsolidering',checkpoint:[4,8,12].includes(i+1),session_ids:sessions.map(s=>s.id),progression:'Ingen automatisk stigning. Ændres efter trænerens vurdering af personens udvikling.'})),acknowledged:false};
}
export function canApprove(p){return p?.status==='draft'&&p.acknowledged===true&&p.flags.every(f=>f.resolved===true);}
