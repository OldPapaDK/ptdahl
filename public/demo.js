import { makeDraft } from './engine.js';
export function makeDemoWorkspace(exercises) {
 const places=[{id:'demo-gym',name:'Democenter · fiktivt udstyr',type:'Center',note:'Kun eksempel. Dette er ikke en verificeret udstyrsliste fra Ground.',inventory:['chair','wall','floor','dumbbells','bands','route','carry','bike','cable','legpress','row','step','bench','ski','sled','sandbag','wallball','kettlebell','legcurl']},{id:'demo-home',name:'Hjemmetræning · eksempel',type:'Hjemme',note:'Et lille udvalg af udstyr til at vise tilpasning.',inventory:['chair','wall','floor','dumbbells','bands','step','route']}];
 const samples=[['demo-anna','Anna Eksempel','HYROX',3,45,0],['demo-mikkel','Mikkel Eksempel','Bedre form',2,35,1],['demo-sara','Sara Eksempel','Mobilitet',2,20,1]];
 const programs=samples.map(([id,name,goal,days,minutes,place],i)=>{
  const answers={name,email:`demo${i+1}@example.test`,age:35+i*8,primary_goal:goal,days_per_week:days,minutes,strength_history:'1 til 2 gange',run_ability:'Ja',health_consent:true,privacy_ack:true,notes:'Fiktivt eksempel til demonstration.'};
  const p=makeDraft(answers,exercises,places[place].inventory);p.id=id;p.answers=answers;
  if(i===0){p.status='approved';p.acknowledged=true;p.flags.forEach(f=>f.resolved=true);p.approved_at=new Date().toISOString();}
  return p;
 });
 return {version:1,programs,places,answers:{},workouts:{}};
}
