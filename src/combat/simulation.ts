import { C, FIGHTERS, type FighterId } from '../data/config';
import { MOVES } from '../data/moves';
import { command, direction } from '../input/commands';
import { ACTIONS, neutral, type Box, type Event, type Fighter, type Input, type Move, type Projectile, type Training } from './types';
export const overlaps=(a:Box,b:Box)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function worldBox(f:Fighter,b:Box):Box {return {x:f.x+(f.facing===1?b.x:-b.x-b.w),y:f.y+b.y,w:b.w,h:b.h};}
export function hurtbox(f:Fighter):Box {return worldBox(f,f.move?.hurtbox??{x:-23,y:f.state==='crouch'?-73:-119,w:46,h:f.state==='crouch'?73:119});}
export function hitboxes(f:Fighter):Box[] {return f.move?.boxes.filter(b=>f.attackFrame>=b.from&&f.attackFrame<=b.to).map(b=>worldBox(f,b.box))??[];}
const controllable=(f:Fighter)=>['idle','walk','crouch','jump'].includes(f.state);
function createFighter(id:FighterId,x:number,facing:1|-1):Fighter {return {id,x,y:C.floor,vx:0,vy:0,facing,state:'idle',stateFrame:0,hp:C.life,meter:0,wins:0,move:null,attackFrame:0,instance:0,hits:new Set(),stun:0,combo:0,comboDamage:0,lastCombo:0,lastDamage:0,history:[],previous:neutral(),pending:null,consumed:-1,parry:0,parryLow:false,parryCooldown:0,protection:0,lastHitHeight:'mid',dashDir:0,throwTarget:null,connected:false,comboMoves:[],lastComboMoves:[]};}
export class Simulation {
  fighters:[Fighter,Fighter]; frame=0; activeFrames=0; phase:'intro'|'fight'|'outro'|'result'|'finisher'='intro'; phaseFrame=0;
  finisherPlayed=false;finisherStartX=0;finisherTargetX=0;
  projectiles:Projectile[]=[]; events:Event[]=[]; freeze=0; round=1; draws=0; winner:number|null=null; reason=''; seed:number; nextId=1;
  training:Training|null=null;
  constructor(ids:[FighterId,FighterId]=['kaio','luma'],seed=1337){this.fighters=[createFighter(ids[0],490,1),createFighter(ids[1],950,-1)];this.seed=seed;}
  random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
  get seconds(){return Math.ceil(Math.max(0,C.roundFrames-this.activeFrames)/60);}
  get canFinish(){return this.phase==='outro'&&this.phaseFrame<90&&!this.finisherPlayed&&this.winner!==null&&this.fighters[this.winner].wins>=2&&this.reason==='K.O.'&&Math.abs(this.fighters[0].x-this.fighters[1].x)<=200&&this.fighters.every(f=>f.y>=C.floor);}
  beginFinisher(){
    if(!this.canFinish||this.winner===null)return false;
    const a=this.fighters[this.winner],b=this.fighters[1-this.winner];a.facing=b.x>=a.x?1:-1;b.facing=a.facing===1?-1:1;
    this.phase='finisher';this.phaseFrame=0;this.finisherPlayed=true;this.freeze=0;this.clearInputs();
    this.finisherStartX=a.x;this.finisherTargetX=Math.max(C.push,Math.min(C.arena-C.push,b.x-a.facing*72));
    this.setState(a,'finisher');this.setState(b,'hitstun');a.vx=b.vx=a.vy=b.vy=0;b.stun=999;
    return true;
  }
  stepFinisher(){
    const a=this.fighters[this.winner!],b=this.fighters[1-this.winner!];this.phaseFrame++;a.stateFrame++;b.stateFrame++;
    if(this.phaseFrame<=18){const t=this.phaseFrame/18;a.x=this.finisherStartX+(this.finisherTargetX-this.finisherStartX)*(1-(1-t)*(1-t));}
    if(this.phaseFrame===24){this.setState(b,'knockdown');b.vx=a.facing*5;b.vy=-7;b.y=C.floor-1;this.events.push({type:'finisher',x:b.x,y:b.y-88,direction:a.facing});}
    if(this.phaseFrame>=24){b.x+=b.vx;b.vx*=.93;this.physics(b);}
    if(this.phaseFrame===48)this.setState(a,'victory');
    if(this.phaseFrame>=60&&b.y>=C.floor)this.setState(b,'defeat');
    if(this.phaseFrame>=90){this.phase='outro';this.phaseFrame=C.outro-30;this.setState(a,'victory');this.setState(b,'defeat');}
  }
  setState(f:Fighter,state:Fighter['state']){if(f.state!==state){f.state=state;f.stateFrame=0;}}
  resetPositions(){this.fighters.forEach((f,i)=>{const fresh=createFighter(f.id,i?950:490,i?-1:1);Object.assign(f,fresh,{wins:f.wins,meter:f.meter});});this.projectiles=[];this.freeze=0;this.activeFrames=0;}
  clearInputs(){this.fighters.forEach(f=>{f.previous=neutral();f.history=[];f.pending=null;f.parry=0;});}
  startMove(f:Fighter,id:string){
    const move=MOVES[f.id][id],cost=id==='super'?C.meter:move?.cost??0;if(!move||f.meter<cost)return false;
    if(!controllable(f)&&!(f.state==='attack'&&f.connected&&f.move?.cancels.includes(id)))return false;
    f.move=move;f.attackFrame=0;f.instance=this.nextId++;f.hits.clear();f.connected=false;if(f.y>=C.floor)f.vx=0;f.throwTarget=null;
    this.setState(f,id==='throw'?'throw':'attack');f.stateFrame=0;
    f.meter-=cost;
    if(id==='super'){this.freeze=C.superFreeze;this.events.push({type:'super',x:f.x,y:f.y-70});}
    else if(!cost)f.meter=Math.min(C.meter,f.meter+C.gainWhiff);
    return true;
  }
  step(inputs:[Input,Input]){
    this.events=[];this.frame++;
    if(this.phase==='result')return;
    if(this.phase==='finisher'){this.stepFinisher();return;}
    if(this.phase!=='fight'){
      if(this.canFinish&&this.winner!==null&&inputs[this.winner].hp&&inputs[this.winner].hk){this.beginFinisher();return;}
      this.phaseFrame++;
      if(this.phase==='intro'&&this.phaseFrame>=C.intro){this.phase='fight';this.phaseFrame=0;this.clearInputs();}
      if(this.phase==='outro'&&this.phaseFrame>=C.outro){
        if(this.fighters.some(f=>f.wins>=2))this.phase='result';
        else {this.round++;this.resetPositions();if(this.draws>=2)this.fighters.forEach(f=>f.hp=150);this.phase='intro';this.phaseFrame=0;}
      }
      return;
    }
    // Hitstop pauses command age as well as physics: taps remain available on release.
    if(this.freeze>0)this.fighters.forEach(f=>{f.history.forEach(h=>h.frame++);if(f.pending)f.pending.frame++;if(f.consumed>=0)f.consumed++;});
    this.fighters.forEach((f,i)=>this.capture(f,inputs[i]));
    if(this.freeze>0){this.freeze--;return;}
    this.activeFrames++;
    const previousX=this.fighters.map(f=>f.x);
    this.fighters.forEach((f,i)=>this.updateFighter(f,this.fighters[1-i],inputs[i],i));
    this.pushboxes(previousX);
    // Gather all contacts before applying stun: both active attacks can trade.
    const contacts:{attacker:number;defender:number;move:Move;key:string;projectile?:Projectile}[]=[];
    this.fighters.forEach((a,i)=>{
      const b=this.fighters[1-i];if(!a.move||!['attack','throw'].includes(a.state))return;
      if(a.move.projectile&&a.attackFrame===a.move.startup){
        this.projectiles.push({id:this.nextId++,owner:i,x:a.x+a.facing*55,y:a.y-75,vx:a.facing*(a.id==='kaio'?7:8.5),life:150,move:a.move,hits:new Set()});
        this.events.push({type:'projectile',x:a.x,y:a.y-70});
      }
      if(a.move.id==='throw'&&a.attackFrame===a.move.startup)this.attemptThrow(a,b,i);
      const interval=a.move.multihit?.filter(n=>a.attackFrame>=n).length??0;
      const key=`${a.instance}:${interval}:${1-i}`;
      if(!a.hits.has(key)&&hitboxes(a).some(box=>overlaps(box,hurtbox(b)))){a.hits.add(key);contacts.push({attacker:i,defender:1-i,move:a.move,key});}
    });
    this.projectiles.forEach(p=>{p.x+=p.vx;p.life--;const b=this.fighters[1-p.owner];if(!p.hits.has(1-p.owner)&&overlaps({x:p.x-19,y:p.y-18,w:38,h:36},hurtbox(b))){p.hits.add(1-p.owner);contacts.push({attacker:p.owner,defender:1-p.owner,move:p.move,key:`p${p.id}`,projectile:p});}});
    // Equal projectiles annihilate before either can cause a contact this frame.
    const clashed=new Set<number>();
    this.projectiles.forEach((a,i)=>this.projectiles.slice(i+1).forEach(b=>{if(a.owner!==b.owner&&Math.abs(a.x-b.x)<40&&Math.abs(a.y-b.y)<40){a.life=b.life=0;clashed.add(a.id);clashed.add(b.id);this.events.push({type:'block',x:(a.x+b.x)/2,y:a.y});}}));
    contacts.forEach(c=>{if(!c.projectile||!clashed.has(c.projectile.id)){this.contact(c.attacker,c.defender,c.move,inputs[c.defender]);if(c.projectile)c.projectile.life=0;}});
    this.fighters.forEach(f=>{if(f.move&&!f.move.projectile&&!f.connected&&f.attackFrame===f.move.startup+f.move.active)this.events.push({type:'whiff',x:f.x,y:f.y-80});});
    this.projectiles=this.projectiles.filter(p=>p.life>0&&p.x>0&&p.x<C.arena);
    this.fighters.forEach(f=>{
      if(this.training?.infiniteLife)f.hp=C.life;
      if(this.training?.infiniteMeter)f.meter=C.meter;
    });
    if(!this.training&&(this.fighters.some(f=>f.hp<=0)||this.activeFrames>=C.roundFrames))this.finishRound();
  }
  capture(f:Fighter,input:Input){
    const pressed=ACTIONS.filter(a=>input[a]&&!f.previous[a]);
    const dir=direction(input.left,input.right,input.up,input.down,f.facing);
    const last=f.history.at(-1);
    if(dir!==last?.dir||pressed.length)f.history.push({frame:this.frame,dir,pressed});
    f.history=f.history.filter(h=>this.frame-h.frame<120);
    const attack=pressed.find(a=>['lp','mp','hp','lk','mk','hk'].includes(a));
    if(attack)f.pending={action:attack,frame:this.frame};
    if(f.pending&&this.frame-f.pending.frame>C.buffer)f.pending=null;
    if(f.parryCooldown===0&&f.y>=C.floor&&controllable(f)){
      if((dir===6&&last?.dir!==6)||(dir===2&&last?.dir!==2)){f.parry=C.parryWindow+1;f.parryLow=dir===2;f.parryCooldown=C.parryCooldown;}
    }
    f.previous={...input};
  }
  updateFighter(f:Fighter,other:Fighter,input:Input,index:number){
    f.stateFrame++;
    if(f.parry>0)f.parry--;if(f.parryCooldown>0)f.parryCooldown--;if(f.protection>0)f.protection--;
    if(controllable(f)&&f.y>=C.floor)f.facing=other.x>=f.x?1:-1;
    if(f.state==='thrown'){
      const tech=f.history.at(-1);
      if(f.stateFrame<=C.throwTech&&input.lp&&input.lk&&tech?.frame===this.frame&&tech.pressed.some(a=>a==='lp'||a==='lk')){
        this.fighters.forEach((x,i)=>{this.setState(x,'hitstun');x.stun=12;x.move=null;x.vx=i===index?-f.facing*4:f.facing*4;x.protection=C.throwProtection;});
        this.events.push({type:'tech',x:f.x,y:f.y-70});return;
      }
      if(f.stateFrame===C.throwTech+1){
        f.hp=Math.max(0,f.hp-C.throwDamage);f.stun=C.knockdown;f.vx=-f.facing*7;this.setState(f,'knockdown');this.events.push({type:'throw',x:f.x,y:f.y-50,value:C.throwDamage});
      }
      return;
    }
    if(['hitstun','blockstun','knockdown','wakeup'].includes(f.state)){
      f.stun--;f.x+=f.vx;f.vx*=.82;
      if(f.stun<=0){
        if(f.state==='knockdown'){this.setState(f,'wakeup');f.stun=C.wakeup;f.protection=C.throwProtection+C.wakeup;}
        else {this.setState(f,f.y<C.floor?'jump':'idle');f.lastCombo=f.combo;f.lastDamage=f.comboDamage;f.lastComboMoves=[...f.comboMoves];f.comboMoves=[];f.combo=0;f.comboDamage=0;f.move=null;}
      }
      if(['hitstun','blockstun','knockdown','wakeup'].includes(f.state)){this.physics(f);return;}
      if(f.y>=C.floor)f.vx=0;
    }
    if(['attack','throw'].includes(f.state)&&f.move){
      f.attackFrame++;
      const m=f.move;
      if(m.velocity&&f.attackFrame>=m.startup&&f.attackFrame<m.startup+m.active)f.x+=m.velocity*f.facing;
      if(m.id==='uppercut'&&f.attackFrame===m.startup)f.vy=-9;
      if(f.attackFrame>=m.startup+m.active+m.recovery){f.move=null;this.setState(f,f.y<C.floor?'jump':'idle');}
    }
    if(f.state==='attack'&&f.move?.launch&&f.connected&&input.up&&f.y>=C.floor){f.move=null;f.vy=C.jump;f.vx=(Number(input.right)-Number(input.left))*FIGHTERS[f.id].speed;this.setState(f,'jump');}
    if(f.pending){
      const action=f.pending.action, punch=action.endsWith('p'),kick=action.endsWith('k');
      let id=command(f.history.filter(h=>h.frame>f.consumed),this.frame,punch,kick,f.meter);
      const posture=f.y<C.floor?'air':input.down?'crouch':'stand';
      const forward=f.facing===1?input.right:input.left,back=f.facing===1?input.left:input.right;
      if(!id&&posture==='stand'){if(forward&&!back&&action==='mp')id='overhead';else if(forward&&!back&&action==='hp')id='launcher';else if(back&&!forward&&action==='hk')id='spin_kick';}
      const next=id??`${posture}_${action}`;
      const canCancel=f.state==='attack'&&f.connected&&f.move?.cancels.includes(next);
      if(controllable(f)||canCancel){
        if(!id&&input.lp&&input.lk&&f.y>=C.floor)id='throw';
        if(id&&f.y<C.floor)id=null;
        if(this.startMove(f,id??`${posture}_${action}`)){if(id)f.consumed=this.frame;f.pending=null;}
      }
    }
    if(f.state==='dash'&&(Number(input.right)-Number(input.left))*f.dashDir<=0){this.setState(f,'idle');f.vx=0;}
    if(controllable(f)&&f.y>=C.floor){
      const dx=Number(input.right)-Number(input.left);
      if(input.up){f.vy=C.jump;f.vx=dx*FIGHTERS[f.id].speed;this.setState(f,'jump');}
      else if(input.down){f.vx=0;this.setState(f,'crouch');}
      else {
        const dir=dx*f.facing>0?6:4;
        const history=f.history.filter((h,i,all)=>h.dir===dir&&all[i-1]?.dir!==dir&&this.frame-h.frame<=C.dashWindow);
        if(dx&&history.length>=2&&history.at(-1)?.frame===this.frame){f.dashDir=dx;f.vx=dx*FIGHTERS[f.id].dash;this.setState(f,'dash');this.events.push({type:'dash',x:f.x,y:f.y});}
        else {f.vx=dx*(dx*f.facing>=0?FIGHTERS[f.id].speed:FIGHTERS[f.id].backSpeed);this.setState(f,dx?'walk':'idle');}
      }
    }
    if(f.state==='dash'){f.x+=f.vx;if(f.stateFrame>14){this.setState(f,'idle');f.vx=0;}}
    else if(['walk','jump'].includes(f.state)||f.y<C.floor&&f.state==='attack')f.x+=f.vx;
    this.physics(f);
  }
  physics(f:Fighter){
    if(f.y<C.floor||f.vy<0){f.y+=f.vy;f.vy+=C.gravity;if(f.y>=C.floor){f.y=C.floor;f.vy=0;this.events.push({type:'land',x:f.x,y:f.y});if(f.state==='jump'){this.setState(f,'idle');f.vx=0;}if(f.state==='attack'&&f.move?.id.startsWith('air_')){f.move=null;this.setState(f,'idle');}}}
    f.x=Math.max(C.push,Math.min(C.arena-C.push,f.x));
  }
  pushboxes(previousX?:number[]){
    const [a,b]=this.fighters;
    if(Math.abs(a.y-b.y)<85&&Math.abs(a.x-b.x)<C.push*2){
      const sign=a.x<=b.x?1:-1,overlap=C.push*2-Math.abs(a.x-b.x);
      // Resolve against whoever moved into contact so an idle fighter is not dragged.
      const approachA=previousX?Math.max(0,(a.x-previousX[0])*sign):0;
      const approachB=previousX?Math.max(0,(previousX[1]-b.x)*sign):0;
      const share=approachA+approachB>0?approachA/(approachA+approachB):.5;
      a.x=Math.max(C.push,Math.min(C.arena-C.push,a.x-overlap*share*sign));b.x=Math.max(C.push,Math.min(C.arena-C.push,b.x+overlap*(1-share)*sign));
      if(Math.abs(a.x-b.x)<C.push*2){if(a.x===C.push||a.x===C.arena-C.push)b.x=a.x+sign*C.push*2;else a.x=b.x-sign*C.push*2;}
    }

  }
  attemptThrow(a:Fighter,b:Fighter,index:number){
    if(b.y<C.floor||b.protection>0||!controllable(b)||Math.abs(a.x-b.x)>C.throwRange)return;
    this.setState(b,'thrown');b.move=null;b.vx=0;b.pending=null;a.throwTarget=1-index;this.events.push({type:'throw',x:b.x,y:b.y-90});
  }
  contact(ai:number,bi:number,move:Move,input:Input){
    const a=this.fighters[ai],b=this.fighters[bi];
    if(['knockdown','wakeup','thrown','defeat'].includes(b.state))return;
    const inv=b.move?.invulnerable;
    if(inv&&b.attackFrame>=inv[0]&&b.attackFrame<=inv[1])return;
    const ground=b.y>=C.floor;
    if(ground&&controllable(b)&&b.parry>0&&b.parryLow===(move.height==='low')){
      b.parry=0;b.meter=Math.min(C.meter,b.meter+12);a.stun=C.parryAdvantage;this.setState(a,'hitstun');a.move=null;a.vx=0;this.freeze=3;this.events.push({type:'parry',x:b.x,y:b.y-85});return;
    }
    const back=b.facing===1?input.left:input.right;
    const blocking=ground&&(controllable(b)||b.state==='blockstun')&&back&&(move.height==='mid'||(move.height==='low'?input.down:!input.down));
    const damage=blocking?(move.special?Math.min(b.hp-1,Math.floor(move.damage*.12)):0):Math.round(move.damage*Math.max(C.comboMin,1-b.combo*C.comboScale));
    b.hp=Math.max(0,b.hp-Math.max(0,damage));b.move=null;b.pending=null;b.vx=a.facing*move.knockback*(blocking?.55:1);
    b.lastHitHeight=move.height;this.setState(b,blocking?'blockstun':move.knockdown&&(!move.multihit||a.attackFrame>=move.multihit.at(-1)!)?'knockdown':'hitstun');
    b.stun=blocking?move.blockstun:b.state==='knockdown'?C.knockdown:move.hitstun;
    if(!blocking){b.combo++;b.comboDamage+=damage;if(b.comboMoves.at(-1)!==move.id)b.comboMoves.push(move.id);if(move.launch){b.vy=-move.launch;b.y=Math.min(b.y,C.floor-1);}}
    a.connected=true;a.meter=Math.min(C.meter,a.meter+(blocking?C.gainBlock:C.gainHit)+move.meter);b.meter=Math.min(C.meter,b.meter+C.gainHurt);
    this.freeze=Math.max(this.freeze,move.hitstop);this.events.push({type:blocking?'block':'hit',x:b.x-a.facing*17,y:b.y-(move.height==='low'?25:85),value:damage,direction:a.facing});
  }
  finishRound(){
    if(this.phase!=='fight')return;
    const [a,b]=this.fighters;
    this.winner=a.hp===b.hp?null:a.hp>b.hp?0:1;
    this.reason=this.activeFrames>=C.roundFrames?'TEMPO ESGOTADO':a.hp<=0&&b.hp<=0?'DOUBLE KO':'K.O.';
    if(this.winner===null)this.draws++;else {this.fighters[this.winner].wins++;this.draws=0;}
    this.phase='outro';this.phaseFrame=0;this.projectiles=[];
    this.fighters.forEach((f,i)=>{f.move=null;f.vx=0;this.setState(f,this.winner===null?'idle':i===this.winner?'victory':'defeat');});
    this.events.push({type:'ko',x:720,y:250});
  }
}
