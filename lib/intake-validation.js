import {options,visibleQuestion} from '../public/questionnaire-model.js';
import {gear} from '../public/equipment.js';
import {normalizeEmail} from './policy.js';
export function cleanAnswers(input,questions,email,complete=false){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Ugyldig besvarelse.');
 const result={};
 for(const q of questions){let value=input[q.key];if(value===undefined)continue;
 if(['privacy_ack','health_consent'].includes(q.key)){if(typeof value!=='boolean')throw Error('Ugyldigt samtykke.');}
 else if(q.type.startsWith('multi')||q.key==='equipment'){if(!Array.isArray(value)||value.length>100||value.some(x=>typeof x!=='string'||x.length>100))throw Error('Ugyldigt flervalgssvar.');value=[...new Set(value)];const allowed=q.key==='equipment'?Object.keys(gear):options[q.key];if(allowed&&value.some(x=>!allowed.includes(x)))throw Error('Ukendt valgmulighed.');if(q.key==='equipment'&&value.includes('none')&&value.length>1)throw Error('Vælg enten intet udstyr eller dit konkrete udstyr.');}
 else{if(typeof value!=='string'&&typeof value!=='number')throw Error('Ugyldigt svar.');value=String(value).trim();if(value.length>1500)throw Error('Svaret er for langt.');const allowed=options[q.key]||(q.type.startsWith('yes_no')?['Ja','Nej',...(q.type.includes('unsure')?['Usikker']:[])]:null);if(value&&allowed&&!allowed.includes(value))throw Error('Ukendt valgmulighed.');if(value&&/integer|number|scale/.test(q.type)&&(!Number.isFinite(+value)||+value<0))throw Error('Ugyldigt tal.');}
 result[q.key]=value;}
 result.email=normalizeEmail(email);
 if(Object.keys(result).some(k=>questions.some(q=>q.key===k&&q.section==='helbred'))&&result.health_consent!==true)throw Error('Bekræft samtykke før helbredsoplysninger gemmes.');
 if(complete){for(const q of questions.filter(q=>q.required&&visibleQuestion(q,result))){const v=result[q.key];if(v===undefined||v===''||Array.isArray(v)&&!v.length||['privacy_ack','health_consent'].includes(q.key)&&v!==true)throw Error('Udfyld: '+q.label_da.split('?')[0]);}
 if(!Number.isInteger(+result.age)||+result.age<18||+result.age>110)throw Error('Denne version er til voksne fra 18 år.');
 if(!Number.isInteger(+result.days_per_week)||+result.days_per_week<1||+result.days_per_week>6)throw Error('Vælg 1 til 6 træningsdage.');
 if(!Number.isInteger(+result.minutes)||+result.minutes<15||+result.minutes>120)throw Error('Vælg 15 til 120 minutter.');}
 // Hidden follow-up fields must not accidentally retain old health or event answers.
 for(const q of questions)if(!visibleQuestion(q,result))delete result[q.key];
 return result;
}
