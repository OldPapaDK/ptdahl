import {createHash,randomUUID} from 'node:crypto';
export const tokenHash=token=>createHash('sha256').update(token).digest('hex');
export function publishedSnapshot(program,exercises){
 if(program?.status!=='approved'||program.acknowledged!==true||program.flags?.some(f=>!f.resolved))throw Error('Gennemgå og godkend forløbet før invitation.');
 const ids=new Set(program.sessions.flatMap(s=>[...s.items,...(s.warmup_items||[])].map(x=>x.exercise_id)));
 const safe=Object.fromEntries(['id','version','status','name','goal','days','minutes','approved_at','sessions','weeks'].map(key=>[key,structuredClone(program[key])]));
 const pick=(value,keys)=>Object.fromEntries(keys.filter(k=>Object.hasOwn(value,k)).map(k=>[k,structuredClone(value[k])]));
 safe.sessions=program.sessions.map(s=>({...pick(s,['id','title','warmup_min','total_seconds']),items:s.items.map(x=>pick(x,['exercise_id','duration_min','sets','reps','per_side','rest_sec','load_kg','effort'])),warmup_items:(s.warmup_items||[]).map(x=>pick(x,['exercise_id','duration_min']))}));
 safe.weeks=program.weeks.map(w=>pick(w,['number','phase','checkpoint','progression']));
 const bank=Object.fromEntries(exercises.filter(e=>ids.has(e.id)).map(e=>[e.id,{id:e.id,name_da:e.name_da,instruction_da:e.instruction_da}]));
 if(ids.size!==Object.keys(bank).length)throw Error('En øvelse mangler i banken.');
 return {snapshot_id:randomUUID(),program:safe,exercises:bank};
}
export function canAccept(grant,user,hash,now=Date.now()){
 return Boolean(grant&&!grant.accepted_user_id&&grant.token_hash===hash&&new Date(grant.expires_at).getTime()>now&&user?.id&&user.verified&&grant.email===String(user.email).trim().toLowerCase());
}
export function validProgress(data,snapshot){
 if(!data||typeof data!=='object'||Array.isArray(data))return false;
 const sessions=snapshot.program.sessions;
 return Object.entries(data).length<=72&&Object.entries(data).every(([key,value])=>{
  if(!/^([1-9]|1[0-2]):[^:]+$/.test(key))return false;const [week,id]=key.split(':');const s=sessions.find(s=>s.id===id);
  return s&&Number.isInteger(+week)&&+week>=1&&+week<=12&&value&&Number.isInteger(value.index)&&value.index>=-1&&value.index<=s.items.length&&Number.isInteger(value.warmup_index??0)&&(value.warmup_index??0)>=0&&(value.warmup_index??0)<=(s.warmup_items?.length||0)&&typeof value.done==='boolean'&&(!value.done||value.index===s.items.length)&&Array.isArray(value.logs)&&value.logs.length<=s.items.length&&value.logs.every(log=>Number.isInteger(log.index)&&log.index>=0&&log.index<s.items.length&&(log.load_kg===null||Number.isFinite(log.load_kg)&&log.load_kg>=0&&log.load_kg<=1000));
 });
}
