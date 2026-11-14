import { C } from '../data/config';
/** Framing never restricts the fighters' physical movement. */
export class ArenaCamera {
  x=0; zoom=1; initialized=false;
  reset(){this.initialized=false;}
  update(a:number,b:number,delta:number,paused=false){
    if(paused&&this.initialized)return this.x;
    const fit=Math.min(1,C.width/(Math.abs(b-a)+140));
    const smoothing=1-Math.exp(-Math.min(delta,100)/140);
    this.zoom=this.initialized?Math.min(fit,this.zoom+(fit-this.zoom)*smoothing):fit;
    const width=C.width/this.zoom,minScroll=-40,maxScroll=C.arena-width+40;
    const target=Math.max(minScroll,Math.min(maxScroll,(a+b)/2-width/2));
    const min=Math.max(minScroll,Math.max(a,b)+50-width),max=Math.min(maxScroll,Math.min(a,b)-50);
    // Keep the framing still while both fighters fit. Following their midpoint
    // can reverse a retreat on screen when the pursuing fighter moves faster.
    this.x=min<=max?Math.max(min,Math.min(max,this.initialized?this.x:target)):target;
    this.initialized=true;return this.x;
  }
}
