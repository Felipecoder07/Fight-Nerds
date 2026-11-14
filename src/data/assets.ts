import scales from './assetScales.json';
import standingScales from './standingScales.json';
import frameScalesV4 from './frameScalesV4.json';
import type { FighterId } from './config';
export interface AnimationAsset { frames: string[]; duration: number; loop: boolean }
export interface FighterAsset {
  image: string; atlas: string; frameWidth?: number; frameHeight?: number; pivot: { x: number; y: number }; scale: number;
  animations: Record<string, AnimationAsset>;
}
const animations: Record<string, AnimationAsset> = {};
function row(name: string, sheet: string, n: number, duration = 4, loop = false, indices = Array.from({ length: 8 }, (_, i) => i)) {
  animations[name] = { frames: indices.map(i => `${sheet}/${n * 8 + i}`), duration, loop };
}
let n=0;
for(const posture of ['stand','crouch','air'])for(const button of ['lp','mp','hp','lk','mk','hk'])row(`${posture}_${button}`,'attacks',n++);
for(const name of ['projectile','uppercut','advance','super'])row(name,'attacks',n++);
['idle','walk','walk_backward','crouch_enter','crouch','crouch_exit','jump','dash','dash_backward','victory','defeat','wakeup'].forEach((name,i)=>row(name,'motion',i,name==='idle'?9:4,['idle','walk','walk_backward','crouch'].includes(name)));
row('jump_start','motion',6,2,false,[0,1]);row('jump_rise','motion',6,4,false,[2]);row('jump_apex','motion',6,4,false,[3]);row('jump_fall','motion',6,4,false,[4]);row('land','motion',6,3,false,[5,6,7]);
['blockstun','block_crouch','parry','parry_low','parry_success','hitstun','hit_low','hit_air','knockdown','recover','throw','throw_whiff','throw_tech','thrown'].forEach((name,i)=>row(name,'reactions',i,3));
const joaoAnim=(indices:number[],duration=4,loop=false):AnimationAsset=>({frames:indices.map(i=>`joao/${i}`),duration,loop});
const joaoAnimations:Record<string,AnimationAsset>={
  idle:joaoAnim([0,1],18,true),
  walk:joaoAnim([2,3],8,true),
  walk_backward:joaoAnim([3,2],8,true),
  crouch_enter:joaoAnim([4],4),
  crouch:joaoAnim([4],4,true),
  crouch_exit:joaoAnim([4,0],4),
  jump:joaoAnim([5],4),
  jump_start:joaoAnim([4,5],2),
  jump_rise:joaoAnim([5],4),
  jump_apex:joaoAnim([5],4),
  jump_fall:joaoAnim([5],4),
  land:joaoAnim([4,0],3),
  dash:joaoAnim([6],4),
  dash_backward:joaoAnim([14,6],4),
  victory:joaoAnim([7],12),
  defeat:joaoAnim([15],8),
  wakeup:joaoAnim([15,4,0],6),
  blockstun:joaoAnim([4],3),
  block_crouch:joaoAnim([4],3),
  parry:joaoAnim([0,8],3),
  parry_low:joaoAnim([4],3),
  parry_success:joaoAnim([8,0],3),
  hitstun:joaoAnim([14],3),
  hit_low:joaoAnim([14],3),
  hit_air:joaoAnim([14],3),
  knockdown:joaoAnim([15],3),
  recover:joaoAnim([4,0],3),
  throw:joaoAnim([11,11,11,11,11,10,0,0],3),
  throw_whiff:joaoAnim([11,11,11,0,0,0,0,0],3),
  throw_tech:joaoAnim([14,0],3),
  thrown:joaoAnim([14,15],3),
  projectile:joaoAnim([8,8,8,9,9,9,8,0],3),
  uppercut:joaoAnim([8,8,10,10,10,10,5,0],3),
  advance:joaoAnim([6,6,12,13,13,13,12,0],3),
  super:joaoAnim([8,9,12,13,10,10,7,0],3),
};
for(const posture of ['stand','crouch','air'])for(const button of ['lp','mp','hp','lk','mk','hk']){
  const kick=button.endsWith('k');
  joaoAnimations[`${posture}_${button}`]=kick?joaoAnim([12,12,12,12,13,13,12,0],3):joaoAnim([8,8,8,8,9,9,8,0],3);
}
export const fighterAssets:Record<FighterId,FighterAsset>={
  kaio:{image:'/assets/fighters/kaio-motion-v4-0.png',atlas:'/assets/fighters/kaio-v4.json',pivot:{x:.5,y:1},scale:1,animations},
  luma:{image:'/assets/fighters/luma-motion-v4-0.png',atlas:'/assets/fighters/luma-v4.json',pivot:{x:.5,y:1},scale:1,animations:{...animations,knockdown:{...animations.knockdown,frames:animations.defeat.frames}}},
  joao:{image:'/assets/fighters/joao-v4-final.png',atlas:'/assets/fighters/joao-v4.json',pivot:{x:.5,y:1},scale:1,animations:joaoAnimations},
};
// Choreography reuses the character's calibrated poses while preserving move timing.
for(const id of ['kaio','luma','joao'] as const){
  const a=fighterAssets[id].animations,sequence=(frames:string[],duration=4):AnimationAsset=>({frames,duration,loop:false});
  a.overhead=sequence([a.stand_hp.frames[0],a.stand_hp.frames[1],a.uppercut.frames[2],a.uppercut.frames[3],a.stand_hp.frames[4],a.stand_hp.frames[5],a.stand_hp.frames[6],a.stand_hp.frames[7]]);
  a.launcher=sequence([...a.uppercut.frames]);
  a.spin_kick=sequence([a.stand_hk.frames[0],a.stand_hk.frames[1],a.stand_hk.frames[2],a.air_hk.frames[3],a.air_hk.frames[4],a.stand_hk.frames[5],a.stand_hk.frames[6],a.stand_hk.frames[7]]);
  a.signature=id==='kaio'?sequence([a.stand_hp.frames[0],a.throw.frames[1],a.stand_hp.frames[2],a.super.frames[3],a.stand_hp.frames[4],a.throw.frames[5],a.stand_hp.frames[6],a.stand_hp.frames[7]]):id==='luma'?sequence([...a.advance.frames]):sequence(['joao/0','joao/12','joao/12','joao/6','joao/4','joao/4','joao/0','joao/0']);
  a.finisher=sequence([a.stand_hp.frames[0],a.stand_hp.frames[1],a.uppercut.frames[2],a.uppercut.frames[3],a.stand_hp.frames[4],a.stand_hp.frames[5],a.victory.frames[0],a.victory.frames.at(-1)!],6);
}
// Per-frame standing measurements prevent shrinking on walks and retreats.
// Crouches, jumps and attacks retain their pose-specific proportions.
export const assetScale=(id:FighterId,frame:string)=>(frameScalesV4[id] as Record<string,number>)[frame]??(standingScales[id] as Record<string,number>)[frame]??(scales[id] as Record<string,number>)[frame.split('/')[0]]??1;
export const stageFloor:Record<string,number>={'sunset-road':717,'moon-temple':717,'rainy-street':717};
