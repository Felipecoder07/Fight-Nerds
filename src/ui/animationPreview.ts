import { fighterAssets } from '../data/assets';
import type { FighterId } from '../data/config';
import { drawPreview } from './spritePreview';
export function showAnimationPreview(parent:HTMLElement,close:()=>void){
  parent.innerHTML='<div class="settings gallery"><h2>GALERIA DE ANIMAÇÕES</h2><p>Oito poses por golpe. Use as setas para navegar e ajustar as opções.</p><label>PERSONAGEM <select id="preview-fighter"><option value="kaio">El Felpo</option><option value="luma">Gusta</option><option value="joao">João</option></select></label><label>AÇÃO <select id="preview-action"></select></label><div id="preview-canvas"><canvas width="480" height="240"></canvas></div><div class="gallery-controls"><button id="preview-play">PAUSAR</button><button id="preview-step">PRÓXIMO QUADRO</button><output id="preview-frame"></output></div><button id="preview-close">VOLTAR</button></div>';
  const fighter=parent.querySelector<HTMLSelectElement>('#preview-fighter')!,action=parent.querySelector<HTMLSelectElement>('#preview-action')!,canvas=parent.querySelector('canvas')!,output=parent.querySelector('output')!;
  action.innerHTML=Object.keys(fighterAssets.kaio.animations).map(a=>`<option value="${a}">${a.replaceAll('_',' ')}</option>`).join('');
  let frame=0,playing=true;
  const render=()=>{const id=fighter.value as FighterId,anim=fighterAssets[id].animations[action.value];frame%=anim.frames.length;output.textContent=`QUADRO ${frame+1} / ${anim.frames.length}`;void drawPreview(canvas,id,action.value,frame);};
  fighter.onchange=action.onchange=()=>{frame=0;render();};
  parent.querySelector<HTMLButtonElement>('#preview-play')!.onclick=e=>{playing=!playing;(e.currentTarget as HTMLButtonElement).textContent=playing?'PAUSAR':'REPRODUZIR';};
  parent.querySelector<HTMLButtonElement>('#preview-step')!.onclick=()=>{playing=false;parent.querySelector('#preview-play')!.textContent='REPRODUZIR';frame++;render();};
  const timer=setInterval(()=>{if(!canvas.isConnected){clearInterval(timer);return;}if(playing){frame++;render();}},110);render();
  parent.querySelector('#preview-close')!.addEventListener('click',()=>{clearInterval(timer);close();});
}
