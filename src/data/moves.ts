import { FIGHTERS, type FighterId } from './config';
import type { Move } from '../combat/types';
const buttons = ['lp','mp','hp','lk','mk','hk'];
export const MOVES:Record<FighterId,Record<string,Move>> = {kaio:{},luma:{},joao:{}};
for (const id of ['kaio','luma','joao'] as const) {
  const f=FIGHTERS[id];
  for(const posture of ['stand','crouch','air']) buttons.forEach((button,i)=>{
    const strength=i%3, kick=i>=3, reach=Math.round(([57,76,96][strength]+(kick?18:0))*f.reach);
    const startup=[4,7,11][strength]+(kick?2:0)-(id==='luma'?1:0)+(id==='joao'&&strength===2?1:0);
    const y=posture==='crouch'?(kick?-28:-59):posture==='air'?-74:(kick?-72:-104);
    const key=`${posture}_${button}`;
    MOVES[id][key]={id:key,startup,active:3+strength,recovery:[9,15,22][strength],damage:Math.round(([38,64,94][strength]+(kick?5:0))*f.damage),hitstun:[13,19,25][strength],blockstun:[8,12,16][strength],hitstop:2+strength,knockback:5+strength*2+(id==='joao'?1:0),height:posture==='air'?'high':posture==='crouch'&&kick?'low':'mid',boxes:[{from:startup,to:startup+3+strength-1,box:{x:18,y,w:reach,h:kick?30:24}}],hurtbox:{x:-24,y:posture==='crouch'?-75:-119,w:48,h:posture==='crouch'?75:119},meter:1+strength,cancels:strength<2?['projectile','uppercut','advance','super']:['super'],effect:kick?'arc':'spark',animation:kick?'kick':'punch',knockdown:posture==='crouch'&&button==='hk'};
  });
  const special=(key:string,extra:Partial<Move>):Move=>({id:key,startup:12,active:7,recovery:23,damage:100,hitstun:26,blockstun:18,hitstop:4,knockback:10,height:'mid',boxes:[{from:12,to:18,box:{x:14,y:-106,w:105*f.reach,h:55}}],hurtbox:{x:-24,y:-115,w:48,h:115},meter:5,cancels:['super'],effect:'energy',animation:'punch',special:true,...extra});
  MOVES[id].projectile=special('projectile',{startup:id==='kaio'?14:id==='joao'?17:20,active:1,recovery:25,projectile:true,boxes:[],damage:id==='joao'?95:85});
  MOVES[id].uppercut=special('uppercut',{startup:5,active:14,recovery:30,boxes:[{from:5,to:18,box:{x:0,y:-156,w:72,h:134}}],invulnerable:[0,8],knockdown:true,velocity:2,animation:'uppercut',damage:id==='joao'?135:125});
  MOVES[id].advance=special('advance',{startup:9,active:14,recovery:21,boxes:[{from:9,to:22,box:{x:10,y:-92,w:90*f.reach,h:55}}],velocity:id==='luma'?9:id==='joao'?7:6,animation:'kick',knockdown:true});
  MOVES[id].super=special('super',{startup:7,active:32,recovery:34,damage:65,hitstun:31,blockstun:18,hitstop:3,knockback:3,boxes:[{from:7,to:38,box:{x:0,y:-140,w:155*f.reach,h:130}}],multihit:[7,15,23,31],invulnerable:[0,11],velocity:3.2,meter:0,knockdown:true,effect:'super',animation:'uppercut',cancels:[]});
  MOVES[id].throw=special('throw',{startup:3,active:1,recovery:26,damage:0,boxes:[],special:false,animation:'throw',cancels:[]});
  MOVES[id].overhead=special('overhead',{startup:16,active:4,recovery:18,damage:82,hitstun:24,blockstun:13,height:'high',special:false,boxes:[{from:16,to:19,box:{x:15,y:-119,w:95*f.reach,h:65}}],animation:'overhead',cancels:['signature','super']});
  MOVES[id].launcher=special('launcher',{startup:10,active:5,recovery:22,damage:76,hitstun:32,blockstun:12,special:false,launch:10.8,knockback:2,boxes:[{from:10,to:14,box:{x:8,y:-130,w:80*f.reach,h:105}}],animation:'launcher',cancels:['uppercut','super']});
  MOVES[id].spin_kick=special('spin_kick',{startup:8,active:15,recovery:24,damage:48,hitstun:23,blockstun:14,special:false,multihit:[8,17],knockback:3,knockdown:true,boxes:[{from:8,to:22,box:{x:8,y:-105,w:105*f.reach,h:46}}],animation:'spin_kick',cancels:['super']});
  MOVES[id].signature=special('signature',{startup:id==='joao'?14:9,active:24,recovery:28,damage:id==='joao'?78:52,hitstun:28,blockstun:16,cost:40,multihit:id==='luma'?[9,17,25]:id==='joao'?[14,28]:[9,23],knockback:2,knockdown:true,height:id==='joao'?'low':'mid',velocity:id==='luma'?4:id==='kaio'?1.5:0,boxes:[{from:id==='joao'?14:9,to:id==='joao'?37:32,box:{x:0,y:id==='joao'?-38:-105,w:130*f.reach,h:id==='joao'?38:78}}],animation:'signature',cancels:['super']});
  // Chains only travel from light to medium to heavy; there are no cancel loops.
  for(const posture of ['stand','crouch','air'])for(const button of buttons){
    const strength=buttons.indexOf(button)%3,move=MOVES[id][`${posture}_${button}`];
    if(strength<2)move.cancels.push(...(strength===0?['mp','mk']:['hp','hk']).map(b=>`${posture}_${b}`));
    if(posture!=='air'&&strength<2)move.cancels.push('overhead','launcher','spin_kick','signature');
  }
}
