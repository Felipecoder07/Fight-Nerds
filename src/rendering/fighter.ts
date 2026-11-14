import Phaser from 'phaser';
import { FIGHTERS } from '../data/config';
import type { Fighter } from '../combat/types';
export function drawFighter(g:Phaser.GameObjects.Graphics,f:Fighter,x:number,y:number,scale=1,clock=0){
  const data=FIGHTERS[f.id],dir=f.facing,s=(n:number)=>n*scale;
  const point=(px:number,py:number)=>({x:x+s(px*dir),y:y+s(py)});
  const line=(a:number[],b:number[],color:number,width:number)=>{const p=point(a[0],a[1]),q=point(b[0],b[1]);g.lineStyle(s(width),color,1);g.lineBetween(p.x,p.y,q.x,q.y);};
  const rect=(px:number,py:number,w:number,h:number,color:number)=>{const p=point(px,py);g.fillStyle(color);g.fillRect(p.x-(dir<0?s(w):0),p.y,s(w),s(h));};
  const circle=(px:number,py:number,r:number,color:number)=>{const p=point(px,py);g.fillStyle(color);g.fillCircle(p.x,p.y,s(r));};
  const crouch=f.state==='crouch'||f.move?.id.startsWith('crouch_'),dead=['knockdown','defeat'].includes(f.state),hurt=['hitstun','blockstun','thrown'].includes(f.state);
  const walk=f.state==='walk'?Math.sin(clock*.24):0,idle=Math.sin(clock*.065)*2;
  if(dead){line([-48,-15],[37,-15],data.color,30);circle(48,-20,17,data.skin);line([-50,-17],[-74,-5],0x1c2330,17);return;}
  const hip=[-3,crouch?-43:-63],shoulder=[hurt?-15:0,crouch?-81:-116+idle],head=[shoulder[0]+3,shoulder[1]-20];
  const jumping=f.y<448;
  let leftFoot=[-28-walk*16,-4],rightFoot=[26+walk*16,-4];
  if(jumping){leftFoot=[-28,-29];rightFoot=[29,-46];}
  let leadHand=[34,shoulder[1]+3],backHand=[-19,shoulder[1]+13];
  const attacking=['attack','throw'].includes(f.state),m=f.move;
  if(attacking&&m){
    const extension=f.attackFrame>=m.startup&&f.attackFrame<m.startup+m.active?1:.35;
    if(m.animation==='kick')rightFoot=[(40+(m.boxes[0]?.box.w??70)*.65)*extension,crouch?-20:-80];
    else if(m.animation==='uppercut')leadHand=[25,-167*extension];
    else leadHand=[(45+(m.boxes[0]?.box.w??60)*.55)*extension,shoulder[1]+3];
  }
  if(f.state==='victory')leadHand=[23,-166];
  if(hurt){leadHand=[-8,-90];backHand=[-34,-80];}
  const knee1=[(hip[0]+leftFoot[0])/2-8,(hip[1]+leftFoot[1])/2],knee2=[(hip[0]+rightFoot[0])/2+12,(hip[1]+rightFoot[1])/2];
  line(hip,knee1,0x151d29,23);line(knee1,leftFoot,0x151d29,20);line(leftFoot,[leftFoot[0]+14,leftFoot[1]],data.light,11);
  line(hip,knee2,f.id==='kaio'?0x303a46:0x27334d,24);line(knee2,rightFoot,f.id==='kaio'?0x303a46:0x27334d,20);line(rightFoot,[rightFoot[0]+14,rightFoot[1]],data.light,11);
  line([shoulder[0]-9,shoulder[1]+6],[-28,shoulder[1]+26],data.skin,14);line([-28,shoulder[1]+26],backHand,data.skin,13);circle(backHand[0],backHand[1],9,data.color);
  line(hip,shoulder,data.color,f.id==='kaio'?37:29);line([hip[0]-7,hip[1]-3],[shoulder[0]-8,shoulder[1]+9],f.id==='kaio'?0xc3442e:0x35968e,9);
  rect(-21,hip[1]-5,40,9,0x151d29);rect(0,hip[1]-5,8,9,data.light);
  circle(head[0],head[1],17,data.skin);rect(head[0]-16,head[1]-16,32,13,data.hair);rect(head[0]-18,head[1]-11,13,17,data.hair);
  if(f.id==='luma'){line([head[0]-12,head[1]-15],[head[0]-35,head[1]+15],data.hair,16);line([head[0]-35,head[1]+15],[head[0]-27,head[1]+33],data.color,9);}
  else {rect(head[0]-18,head[1]-3,36,5,data.color);line([head[0]-18,head[1]],[-44,head[1]+5+Math.sin(clock*.2)*4],data.color,6);}
  rect(head[0]+7,head[1]+1,7,3,0x1a1e27);
  line([shoulder[0]+9,shoulder[1]+7],[18,shoulder[1]+24],data.skin,16);line([18,shoulder[1]+24],leadHand,data.skin,14);circle(leadHand[0],leadHand[1],10,data.color);rect(leadHand[0]-6,leadHand[1]-8,11,5,data.light);
}
