import type { Fighter } from '../combat/types';
import { C } from '../data/config';
import { fighterAssets } from '../data/assets';
export class FighterAnimation {
  state=''; entered=0; previousY=C.floor; transient=''; until=0;
  react(name:string,clock:number,duration=18){this.transient=name;this.until=clock+duration;}
  frame(f:Fighter,clock:number){
    const changed=this.state!==f.state;
    if(changed){if(this.state==='crouch'&&f.state==='idle')this.react('crouch_exit',clock,12);if(this.state==='jump'&&f.state==='idle'&&f.y>=C.floor)this.react('land',clock,9);this.state=f.state;this.entered=clock;}
    let key=f.move?.id??f.state,age=['victory','defeat'].includes(f.state)?clock-this.entered:f.stateFrame;
    if(f.state==='walk')key=f.vx*f.facing<0?'walk_backward':'walk';
    if(f.state==='dash')key=f.dashDir*f.facing<0?'dash_backward':'dash';
    if(f.state==='crouch'&&age<16)key='crouch_enter';
    if(f.state==='jump')key=age<3?'jump_start':f.vy<-3?'jump_rise':f.vy>3?'jump_fall':'jump_apex';
    if(f.state==='blockstun')key=f.previous.down?'block_crouch':'blockstun';
    if(f.state==='hitstun')key=f.y<C.floor?'hit_air':f.lastHitHeight==='low'?'hit_low':'hitstun';
    if(['idle','walk','crouch'].includes(f.state)&&f.parry>0)key=f.parryLow?'parry_low':'parry';
    if(this.until>clock&&(['idle','walk','crouch'].includes(f.state)||f.state==='hitstun'&&this.transient==='throw_tech')){key=this.transient;age=clock-(this.until-(key==='land'?9:key==='crouch_exit'?12:18));}
    if(f.move?.id==='throw')key=f.throwTarget===null?'throw_whiff':'throw';
    const asset=fighterAssets[f.id],anim=asset.animations[key]??asset.animations.idle;
    let n=Math.floor(age/anim.duration);
    if(f.move){const m=f.move,peak=4;n=f.attackFrame<m.startup?Math.floor(f.attackFrame/m.startup*peak):f.attackFrame<m.startup+m.active?peak:5+Math.floor((f.attackFrame-m.startup-m.active)/m.recovery*3);if(m.multihit&&f.attackFrame>=m.startup&&f.attackFrame<m.startup+m.active){const since=f.attackFrame-(m.multihit.findLast(at=>at<=f.attackFrame)??m.startup);n=since<3?4:since<6?5:3;}}
    return anim.frames[anim.loop?Math.max(0,n)%anim.frames.length:Math.min(anim.frames.length-1,Math.max(0,n))];
  }
}
