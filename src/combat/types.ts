import type { FighterId } from '../data/config';
export const ACTIONS = ['left','right','up','down','lp','mp','hp','lk','mk','hk'] as const;
export type Action = typeof ACTIONS[number];
export type Input = Record<Action, boolean>;
export const neutral = (): Input => Object.fromEntries(ACTIONS.map(a=>[a,false])) as Input;
export type State = 'idle'|'walk'|'crouch'|'jump'|'dash'|'attack'|'blockstun'|'hitstun'|'knockdown'|'wakeup'|'throw'|'thrown'|'victory'|'defeat'|'finisher';
export type Height = 'high'|'mid'|'low';
export interface Box { x:number; y:number; w:number; h:number }
export interface Move {
  id:string; startup:number; active:number; recovery:number; damage:number; hitstun:number;
  blockstun:number; hitstop:number; knockback:number; height:Height; boxes:{from:number;to:number;box:Box}[];
  hurtbox:Box; meter:number; cancels:string[]; effect:string; animation:string;
  special?:boolean; projectile?:boolean; velocity?:number; invulnerable?:[number,number];
  knockdown?:boolean; multihit?:number[]; launch?:number; cost?:number;
}
export interface RecordFrame { frame:number; dir:number; pressed:Action[] }
export interface Fighter {
  id:FighterId; x:number; y:number; vx:number; vy:number; facing:1|-1; state:State; stateFrame:number;
  hp:number; meter:number; wins:number; move:Move|null; attackFrame:number; instance:number;
  hits:Set<string>; stun:number; combo:number; comboDamage:number; lastCombo:number; lastDamage:number;
  history:RecordFrame[]; previous:Input; pending:{action:Action;frame:number}|null;
  consumed:number; parry:number; parryLow:boolean; parryCooldown:number; protection:number;
  lastHitHeight:Height; dashDir:number; throwTarget:number|null; connected:boolean;
  comboMoves:string[]; lastComboMoves:string[];
}
export interface Projectile { id:number; owner:number; x:number; y:number; vx:number; life:number; move:Move; hits:Set<number> }
export interface Event { type:'hit'|'block'|'parry'|'throw'|'tech'|'super'|'ko'|'round'|'projectile'|'whiff'|'land'|'dash'|'finisher'|'blood'; x:number;y:number;value?:number;direction?:number }
export interface Training { infiniteLife:boolean; infiniteMeter:boolean; dummy:'idle'|'block'|'jump'|'ai'; boxes:boolean; speed:number }
