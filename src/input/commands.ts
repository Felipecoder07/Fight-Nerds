import { C } from '../data/config';
import type { RecordFrame } from '../combat/types';
export function matchMotion(history:RecordFrame[], pattern:number[], now:number):boolean {
  const recent=history.filter(h=>now-h.frame<=C.commandWindow);
  let p=pattern.length-1, last=now;
  for(let i=recent.length-1;i>=0;i--){
    const h=recent[i];
    if(h.dir===pattern[p]){
      if(last-h.frame>C.transitionTolerance && p<pattern.length-1)return false;
      last=h.frame;p--;
      if(p<0)return true;
    }
  }
  return false;
}
export function command(history:RecordFrame[], now:number, punch:boolean, kick:boolean, meter:number):string|null {
  if(punch&&meter>=C.meter&&matchMotion(history,[2,3,6,2,3,6],now))return 'super';
  if(kick&&matchMotion(history,[2,5,2],now))return 'signature';
  const final=history.findLast(h=>h.dir!==5)?.dir;
  if(punch&&final===3&&matchMotion(history,[6,2,3],now))return 'uppercut';
  if(punch&&matchMotion(history,[2,3,6],now))return 'projectile';
  if(kick&&matchMotion(history,[2,1,4],now))return 'advance';
  return null;
}
export function direction(left:boolean,right:boolean,up:boolean,down:boolean,facing:number):number {
  const x=(Number(right)-Number(left))*facing, y=Number(up)-Number(down);
  return 5+x+y*3;
}
