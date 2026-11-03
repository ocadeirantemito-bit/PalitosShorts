import {stateSchema,type State} from './model';
import {ensurePlan,initialState} from './catalog';
export const storageKey='palito-show-v1';
export function load():State{const text=localStorage.getItem(storageKey);if(!text)return ensurePlan(initialState());return ensurePlan(stateSchema.parse(JSON.parse(text)));}
export function persist(s:State){localStorage.setItem(storageKey,JSON.stringify(stateSchema.parse(s)));}
export function parseBackup(text:string):State{return stateSchema.parse(JSON.parse(text));}
