import { assetScale, fighterAssets } from '../data/assets';
import type { FighterId } from '../data/config';
type Frame={filename:string;frame:{x:number;y:number;w:number;h:number};pivot:{x:number;y:number}};
const cache=new Map<string,Promise<Map<string,{image:HTMLImageElement;frame:Frame}>>>();
async function load(id:FighterId){
  if(!cache.has(id))cache.set(id,(async()=>{const data=await (await fetch(fighterAssets[id].atlas)).json(),map=new Map<string,{image:HTMLImageElement;frame:Frame}>();await Promise.all(data.textures.map(async(t:{image:string;frames:Frame[]})=>{const image=new Image();image.src='/assets/fighters/'+t.image;await image.decode();t.frames.forEach(frame=>map.set(frame.filename,{image,frame}));}));return map;})());return cache.get(id)!;
}
export async function drawPreview(canvas:HTMLCanvasElement,id:FighterId,key:string,index:number){
  const frames=await load(id);if(!canvas.isConnected)return;const anim=fighterAssets[id].animations[key]??fighterAssets[id].animations.idle,name=anim.frames[index%anim.frames.length],item=frames.get(name);if(!item)return;
  const logicalWidth=Number(canvas.dataset.logicalWidth??canvas.width),logicalHeight=Number(canvas.dataset.logicalHeight??canvas.height);
  canvas.dataset.logicalWidth=String(logicalWidth);canvas.dataset.logicalHeight=String(logicalHeight);
  if(canvas.width!==logicalWidth*2){canvas.width=logicalWidth*2;canvas.height=logicalHeight*2;}
  const ctx=canvas.getContext('2d')!,f=item.frame.frame,s=assetScale(id,name)*Math.min(logicalHeight/160,1.5);
  ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,logicalWidth,logicalHeight);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(item.image,f.x,f.y,f.w,f.h,logicalWidth/2-f.w*s*item.frame.pivot.x,logicalHeight-8-f.h*s*item.frame.pivot.y,f.w*s,f.h*s);
}
export function animateSelection(root:HTMLElement,ids:FighterId[]){
  root.querySelectorAll<HTMLCanvasElement>('.selection-preview').forEach((canvas,i)=>{let frame=0;const timer=window.setInterval(()=>{if(!canvas.isConnected){clearInterval(timer);return;}void drawPreview(canvas,ids[i],'idle',frame++);},150);void drawPreview(canvas,ids[i],'idle',0);});
}
