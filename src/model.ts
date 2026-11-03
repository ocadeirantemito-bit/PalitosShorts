import {z} from 'zod';
export const categories=['Humor','Motivação','Saudações','Reflexões'] as const;
export const actions=['falar','rir','surpresa','andar','acenar','pular','apontar','triste','comemorar','negar','cruzar','escorregar'] as const;
export const sceneSchema=z.object({speaker:z.enum(['PALITO','TICO']),line:z.string().trim().min(1).max(240),caption:z.string().max(240),action:z.enum(actions)});
export const projectSchema=z.object({id:z.string().min(1).max(100),title:z.string().trim().min(1).max(90),category:z.enum(categories),duration:z.union([z.literal(15),z.literal(30)]),background:z.enum(['creme','azul','lilas']),setting:z.enum(['sala','parque','cafe']).optional(),scenes:z.array(sceneSchema).min(2).max(8),created:z.string(),status:z.enum(['roteiro','editado','exportado']),renderId:z.string().regex(/^[a-f0-9-]{36}$/).optional(),approved:z.boolean().optional(),sound:z.boolean()});
export type Project=z.infer<typeof projectSchema>;
export type Scene=z.infer<typeof sceneSchema>;
export const settingsSchema=z.object({theme:z.enum(['dark','light']),favorite:z.enum(categories),duration:z.union([z.literal(15),z.literal(30)]),sound:z.boolean()});
export const stateSchema=z.object({version:z.literal(1),projects:z.array(projectSchema).max(1000),plan:z.record(z.string(),z.string()),settings:settingsSchema,exported:z.number().int().nonnegative()}).superRefine((s,c)=>{const ids=new Set(s.projects.map(p=>p.id));if(ids.size!==s.projects.length||Object.values(s.plan).some(id=>!ids.has(id)))c.addIssue({code:z.ZodIssueCode.custom,message:'Planejamento inconsistente'});});
export type State=z.infer<typeof stateSchema>;
export const dateKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function sceneTimes(p:Project){const weights=p.scenes.map(s=>Math.max(12,s.line.length+s.caption.length*.3));const total=weights.reduce((a,b)=>a+b,0);let cursor=0;return weights.map((w,i)=>{const start=cursor;cursor=i===weights.length-1?p.duration*30:cursor+Math.round(w/total*p.duration*30);return {start,end:cursor};});}
export function tooLong(p:Project){return p.scenes.reduce((a,s)=>a+s.line.length,0)>p.duration*14;}

// getRandomValues also works over HTTP on a trusted local network (iPhone).
export function createId(){const b=new Uint8Array(16);crypto.getRandomValues(b);b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=Array.from(b,n=>n.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
