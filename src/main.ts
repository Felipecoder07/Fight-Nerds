import { animateSelection } from './ui/spritePreview';
import Phaser from 'phaser';
import './style.css';
import './improvements.css';
import { installNavigation } from './ui/navigation';
import { showAnimationPreview } from './ui/animationPreview';
import { ArenaScene } from './scenes/ArenaScene';
import { Simulation } from './combat/simulation';
import { neutral, ACTIONS, type Action, type Input } from './combat/types';
import { InputManager } from './input/manager';
import { keyConflict } from './input/preferences';
import { deviceFields, bindDevices } from './ui/devices';
import { AI, type Difficulty } from './ai/controller';
import { C, FIGHTERS, STAGES, type FighterId } from './data/config';
import { Synth } from './audio/synth';
import { showMoveGuide } from './ui/moveGuide';

const input=new InputManager(),audio=new Synth(),scene=new ArenaScene();
const overlay=document.querySelector<HTMLDivElement>('#overlay')!;
let sim=new Simulation(),mode:'ai'|'local'|'training'='ai',difficulty:Difficulty='normal';
let ids:[FighterId,FighterId]=['kaio','luma'],stage=0,screen='boot',paused=false,accumulator=0;
let ai=new AI(),shortcut:Input[]=[],padCapture:{armed:boolean;player:number;action:Action;button:HTMLButtonElement}|null=null;
const label:Record<Action,string>={left:'Esquerda',right:'Direita',up:'Pular',down:'Agachar',lp:'Soco fraco',mp:'Soco médio',hp:'Soco forte',lk:'Chute fraco',mk:'Chute médio',hk:'Chute forte'};
const $=(id:string)=>document.getElementById(id)!;
const bind=(id:string,fn:()=>void)=>$(id).addEventListener('click',fn);
const keyName=(s:string)=>s.replace('Key','').replace('Digit','').replace('Arrow','').replace('Left','←').replace('Right','→').replace('Up','↑').replace('Down','↓').replace('Escape','Esc');
const chip=(s:string)=>`<kbd>${s}</kbd>`;
function setOverlay(html:string,cls=''){input.clear();overlay.className=cls;overlay.innerHTML=html;}
function guide(back:()=>void){screen='guide';input.clear();sim.clearInputs();setOverlay('','solid-screen');showMoveGuide(overlay,input.prefs,back);}
function syncAudio(){audio.volume=input.prefs.volume;audio.muted=input.prefs.mute;$('sound').textContent=input.prefs.mute?'SOM OFF':'SOM ON';}
function setStage(n:number){stage=n;scene.selectStage(n);}
function attract(){scene.attract=true;scene.sim=new Simulation();scene.sim.fighters[0].x=850;scene.sim.fighters[1].x=1130;scene.sim.fighters[0].state='idle';}
async function fullscreen(){const c=$('cabinet');if(c.classList.contains('expanded')){c.classList.remove('expanded');fullButton.textContent='TELA CHEIA';return;}try{if(document.fullscreenElement)await document.exitFullscreen();else if(c.requestFullscreen)await c.requestFullscreen();else c.classList.toggle('expanded');}catch{c.classList.toggle('expanded');}fullButton.textContent=document.fullscreenElement||c.classList.contains('expanded')?'SAIR DA TELA CHEIA':'TELA CHEIA';}
const fullButton=document.createElement('button');fullButton.id='fullscreen';fullButton.textContent='TELA CHEIA';$('cabinet').append(fullButton);fullButton.onclick=()=>void fullscreen();
document.addEventListener('fullscreenchange',()=>{fullButton.textContent=document.fullscreenElement?'SAIR DA TELA CHEIA':'TELA CHEIA';window.dispatchEvent(new Event('resize'));});
function menu(){
  if(!scene.ready)return;
  screen='menu';paused=false;input.clear();input.usedPads.clear();scene.sprites.forEach(s=>s.setVisible(false));setStage(0);attract();
  setOverlay(`<div class="menu-copy"><div class="tag">ARCADE FIGHTING / VOL. 01</div><h1>A RUA É<br>O <em>RINGUE.</em></h1><p>Tr?s lutadores. Uma disputa.<br>O próximo round começa com você.</p><button class="primary" id="play">ENTRAR NA LUTA <span>↗</span></button><div class="quick-modes"><button data-quick="ai">VERSUS IA</button><button data-quick="local">VERSUS LOCAL</button><button data-quick="training">TREINAMENTO</button></div><button class="text-button" id="move-guide">GOLPES &amp; COMBOS →</button><button class="text-button" id="instructions">CONTROLES & OPÇÕES <span>→</span></button><div class="menu-note">${chip('ENTER')} PARA COMEÇAR <span>1—2 JOGADORES</span></div></div><div class="menu-fighters">${portrait('kaio')}${portrait('luma')}${portrait('joao')}</div><div class="edition">FIGHT<br><strong>NERDS</strong><small>ORIGINAL FIGHTING SYSTEM</small></div><div class="stage-label">01 / ROTA DO SOL <span>SÃO PAULO, BR</span></div>`,'home-screen');
  overlay.querySelectorAll<HTMLButtonElement>('[data-quick]').forEach(b=>b.onclick=()=>{mode=b.dataset.quick as typeof mode;selection();});
  bind('play',selection);bind('instructions',()=>settings(menu));bind('move-guide',()=>guide(menu));
}
function portrait(id:FighterId){return `<span class="real-portrait ${id}" role="img" aria-label="${FIGHTERS[id].name}"></span>`;}
function selection(){
  screen='selection';paused=false;attract();
  setOverlay(`<div class="selection"><div class="section-head"><div><div class="tag">PREPARE SEU ROUND</div><h2>ESCOLHA SUA LUTA<span>.</span></h2></div><button id="back" class="back">← MENU</button></div><div class="mode-tabs">${[['ai','VERSUS IA','01'],['local','VERSUS LOCAL','02'],['training','TREINAMENTO','03']].map(([m,n,k])=>`<button class="${mode===m?'selected':''}" data-mode="${m}"><small>${k}</small>${n}</button>`).join('')}</div><div class="selection-grid">${[0,1].map(p=>`<div class="fighter-select"><div class="field-label">${p?'OPONENTE / JOGADOR 2':'SEU LUTADOR / JOGADOR 1'}</div><canvas class="selection-preview" width="210" height="150" aria-label="Lutador selecionado"></canvas><div class="fighter-choices">${(['kaio','luma','joao'] as const).map(id=>`<button data-player="${p}" data-fighter="${id}" class="fighter-card ${ids[p]===id?'selected':''} ${id}">${portrait(id)}<span>${FIGHTERS[id].name}<small>${FIGHTERS[id].style}</small></span></button>`).join('')}</div></div>`).join('')}<div class="stage-select"><div class="field-label">ARENA / ${String(stage+1).padStart(2,'0')}</div>${STAGES.map((s,i)=>`<button class="stage-card stage-${i} ${stage===i?'selected':''}" data-stage="${i}"><b>${s.name}</b><small>${s.area}</small><span>↗</span></button>`).join('')}</div></div>${deviceFields(input)}<div class="selection-bottom"><label>DIFICULDADE <select id="difficulty">${(['fácil','normal','difícil'] as const).map(d=>`<option ${d===difficulty?'selected':''}>${d}</option>`).join('')}</select></label><span class="hint">Mesmo personagem? Vale.<br>Seu estilo faz a diferença.</span><button class="primary" id="start">${mode==='training'?'TREINAR':'COMEÇAR ROUND'} <span>→</span></button></div></div>`,'solid-screen');
  bindDevices(overlay,input);animateSelection(overlay,ids);
  bind('back',menu);bind('start',start);
  overlay.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode as typeof mode;selection();});
  overlay.querySelectorAll<HTMLButtonElement>('[data-fighter]').forEach(b=>b.onclick=()=>{ids[Number(b.dataset.player)]=b.dataset.fighter as FighterId;selection();});
  overlay.querySelectorAll<HTMLButtonElement>('[data-stage]').forEach(b=>b.onclick=()=>{setStage(Number(b.dataset.stage));selection();});
  ($('difficulty').parentElement as HTMLElement).hidden=mode==='local';
  $('difficulty').onchange=e=>difficulty=(e.target as HTMLSelectElement).value as Difficulty;
}
function start(){
  if(!input.ready()){settings(selection);return;}
  audio.unlock();input.clear();input.usedPads.clear();sim=new Simulation(ids);ai=new AI(difficulty);shortcut=[];scene.effects=[];scene.comboReadouts=[{text:'',until:0},{text:'',until:0}];
  if(mode==='training'){sim.training={infiniteLife:true,infiniteMeter:true,dummy:'idle',boxes:false,speed:1};sim.phase='fight';sim.fighters.forEach(f=>f.meter=100);}
  screen='fight';paused=false;accumulator=0;scene.attract=false;scene.sim=sim;setStage(stage);fightOverlay();
}
function fightOverlay(){
  if(mode!=='training'){setOverlay('','playing');return;}
  setOverlay(`<div class="training-bar"><b>LAB</b><button id="train-settings">AJUSTES</button><button id="boxes">CAIXAS ${sim.training?.boxes?'ON':'OFF'}</button><button id="train-guide">GOLPES</button><button id="reset">REINICIAR [${keyName(input.prefs.reset)}]</button><button id="pause-train">${paused?'CONTINUAR':'PAUSAR'}</button><span>60 Hz / ${sim.training?.speed===.5?'0.5':'1'}x</span></div>`,'playing');
  bind('train-settings',trainingOptions);bind('boxes',()=>{sim.training!.boxes=!sim.training!.boxes;fightOverlay();});bind('reset',resetTraining);bind('pause-train',()=>togglePause());bind('train-guide',()=>{togglePause(true);guide(()=>{screen='fight';paused=false;togglePause();});});
}
function resetTraining(){if(screen==='fight'&&mode==='training'){sim.resetPositions();sim.clearInputs();input.clear();if(sim.training?.infiniteMeter)sim.fighters.forEach(f=>f.meter=100);}}
function togglePause(force=false){
  if(screen!=='fight')return;if(force&&paused)return;
  paused=!paused;input.clear();sim.clearInputs();accumulator=0;
  if(!paused){if(!input.ready()){paused=true;settings(()=>{screen='fight';paused=false;togglePause();});return;}fightOverlay();return;}
  setOverlay(`<div class="pause-panel"><div class="tag">RESPIRE. O ROUND ESPERA.</div><h2>PAUSADO<span>Ⅱ</span></h2><button class="primary" id="resume">CONTINUAR <span>→</span></button>${mode==='training'?'<button id="frame-step">AVANÇAR 1 FRAME [ . ]</button><button id="lab-options">AJUSTES DO TREINO</button>':''}<button id="pause-guide">GOLPES &amp; COMBOS</button><button id="pause-options">CONTROLES & OPÇÕES</button><button id="reselect">NOVA SELEÇÃO</button><button id="quit">VOLTAR AO MENU</button></div>`,'pause-screen');
  bind('resume',()=>togglePause());bind('pause-options',()=>settings(()=>{paused=false;togglePause();}));bind('reselect',selection);bind('quit',menu);bind('pause-guide',()=>guide(()=>{screen='fight';paused=false;togglePause();}));
  if(mode==='training'){bind('frame-step',stepOne);bind('lab-options',trainingOptions);}
}
function stepOne(){if(screen==='fight'&&paused&&mode==='training')tick(true);}
function trainingOptions(){
  screen="training-options";
  paused=true;input.clear();sim.clearInputs();const t=sim.training!;
  setOverlay(`<div class="pause-panel lab-panel"><div class="tag">TREINAMENTO / LABORATÓRIO</div><h2>SEU RITMO<span>.</span></h2><label><input type="checkbox" id="infinite-life" ${t.infiniteLife?'checked':''}> Vida infinita</label><label><input type="checkbox" id="infinite-meter" ${t.infiniteMeter?'checked':''}> Super infinito</label><label><input type="checkbox" id="hitboxes" ${t.boxes?'checked':''}> Exibir caixas de colisão</label><label>DUMMY <select id="dummy">${[['idle','Parado'],['block','Defendendo'],['jump','Pulando'],['ai','Inteligência artificial']].map(([v,n])=>`<option value="${v}" ${t.dummy===v?'selected':''}>${n}</option>`).join('')}</select></label><label>VELOCIDADE <select id="speed"><option value="1" ${t.speed===1?'selected':''}>Normal / 60 Hz</option><option value="0.5" ${t.speed===.5?'selected':''}>Metade / 0.5x</option></select></label><p>Histórico, estado, frame, combo e dano aparecem na arena. Pause e use ponto [ . ] para avançar um frame.</p><button class="primary" id="lab-done">VOLTAR AO TREINO →</button></div>`,'pause-screen');
  $('infinite-life').onchange=e=>t.infiniteLife=(e.target as HTMLInputElement).checked;$('infinite-meter').onchange=e=>t.infiniteMeter=(e.target as HTMLInputElement).checked;$('hitboxes').onchange=e=>t.boxes=(e.target as HTMLInputElement).checked;$('dummy').onchange=e=>t.dummy=(e.target as HTMLSelectElement).value as typeof t.dummy;$('speed').onchange=e=>t.speed=Number((e.target as HTMLSelectElement).value);
  bind('lab-done',()=>{screen='fight';paused=false;accumulator=0;fightOverlay();});
}
function result(){
  screen='result';const win=sim.winner??0,f=FIGHTERS[sim.fighters[win].id];
  setOverlay(`<div class="result-panel"><div class="tag">FIM DE PARTIDA / MELHOR DE TRÊS</div><div class="result-portrait">${portrait(sim.fighters[win].id)}</div><h2>${f.name} <em>VENCEU.</em></h2><p>${sim.fighters[0].wins} — ${sim.fighters[1].wins} <span>•</span> RESPEITE O PRÓXIMO ROUND.</p><button class="primary" id="rematch">REVANCHE <span>↻</span></button><button id="new-select">NOVA SELEÇÃO →</button><button id="result-menu">VOLTAR AO MENU</button></div>`,'result-screen');
  bind('rematch',start);bind('new-select',selection);bind('result-menu',menu);
}
function settings(back:()=>void){
 const previousScreen=screen;screen="settings";
  const p=input.prefs;input.clear();
  setOverlay(`<div class="settings"><div class="section-head"><div><div class="tag">MANUAL DO SISTEMA</div><h2>CONTROLES & OPÇÕES<span>.</span></h2></div><button class="back" id="settings-back">← VOLTAR</button></div><div class="settings-scroll">${deviceFields(input)}<div class="control-columns">${[0,1].map(i=>`<div><h3>JOGADOR ${i+1}</h3><div class="mapping-head"><span>AÇÃO</span><span>TECLADO</span><span>CONTROLE</span></div>${ACTIONS.map(a=>`<div class="mapping"><span>${label[a]}</span><button data-key-player="${i}" data-action="${a}">${keyName(p.keys[i][a])}</button><button data-pad-player="${i}" data-action="${a}">B${p.buttons[i][a]}</button></div>`).join('')}</div>`).join('')}<div class="rules"><h3>DOMINE O ROUND</h3><p>Segure para trás para defender. Baixos exigem defesa agachada; ataques aéreos exigem defesa em pé. Não há defesa no ar.</p><p><b>→ → / ← ←</b> Dash / recuo<br><b>↓ ↘ → + P</b> Projétil<br><b>→ ↓ ↘ + P</b> Antiaéreo<br><b>↓ ↙ ← + K</b> Avanço<br><b>↓ ↘ → ↓ ↘ → + P</b> Super (100)</p><p><b>LP + LK</b> Agarrão / escape (10 frames)<br><b>Toque →</b> Parry alto / médio<br><b>Toque ↓</b> Parry baixo (7 frames)<br><b>Esc / Start</b> Pausar</p><small>Direções relativas ao oponente. P = soco; K = chute. Melhor de 3, 99 segundos. Super preservado entre rounds.</small></div></div><div id="conflicts" class="notice"></div><p class="notice">Clique numa tecla ou botão para remapear. Teclados podem ter ghosting ao pressionar muitas teclas: tente outras combinações ou use controles. Até 2 gamepads; direcional ou analógico.</p><button id="animation-gallery">GALERIA DE ANIMAÇÕES</button><button id="restore-controls">RESTAURAR CONTROLES PADRÃO</button><div class="options"><label>VOLUME <input id="volume" type="range" min="0" max="1" step=".05" value="${p.volume}"></label><label>DEADZONE <input id="deadzone" type="range" min=".1" max=".8" step=".05" value="${p.deadzone}"></label><label><input id="blood" type="checkbox" ${p.blood?'checked':''}> Sangue estilizado</label><label><input id="shake" type="checkbox" ${p.shake?'checked':''}> Tremor</label><label><input id="flashes" type="checkbox" ${p.reduceFlash?'checked':''}> Reduzir flashes</label><label><input id="accessible" type="checkbox" ${p.accessible?'checked':''}> Atalhos acessíveis</label><button id="reset-key">REINICIAR TREINO: ${keyName(p.reset)}</button></div><p class="notice">Atalhos: 1 projétil · 2 antiaéreo · 3 avanço · 4 super. Disponíveis no treino ou com modo acessível ativado. Mute no cabeçalho. Preferências salvas neste navegador.</p></div></div>`,'solid-screen');
  bindDevices(overlay,input);
  bind('animation-gallery',()=>{screen='gallery';showAnimationPreview(overlay,()=>{screen=previousScreen;settings(back);});});
  bind('restore-controls',()=>{input.restore();screen=previousScreen;settings(back);});
  const conflict=()=>{const keys=p.keys.flatMap(Object.values);const duplicates=[...new Set(keys.filter((k,i)=>keys.indexOf(k)!==i||['Escape','Enter','Period',p.reset].includes(k)))];const padDup=p.buttons.some(m=>new Set(Object.values(m)).size<10);$('conflicts').textContent=duplicates.length||padDup?`Conflitos: ${duplicates.map(keyName).join(', ')}${padDup?' · Botões de controle repetidos':''}. Ajuste para evitar ações simultâneas.`:'Sem conflitos de teclas.';};conflict();
  bind('settings-back',()=>{input.capture=null;padCapture=null;screen=previousScreen;back();});
  overlay.querySelectorAll<HTMLButtonElement>('[data-key-player]').forEach(b=>b.onclick=()=>{const original=b.textContent;b.textContent='ESC cancela';input.onCancelCapture=()=>{b.textContent=original;};input.capture=code=>{const player=Number(b.dataset.keyPlayer),action=b.dataset.action as Action,error=code===p.reset?'Tecla reservada ao treino.':keyConflict(p.keys,code,player,action);if(error){b.textContent=keyName(p.keys[player][action]);$('conflicts').textContent=error;return;}p.keys[player][action]=code;b.textContent=keyName(code);input.save();conflict();};});
  overlay.querySelectorAll<HTMLButtonElement>('[data-pad-player]').forEach(b=>b.onclick=()=>{if(input.prefs.devices[Number(b.dataset.padPlayer)]==='keyboard'){$('conflicts').textContent='Selecione um controle para este jogador primeiro.';return;}b.textContent='APERTE / ESC cancela';padCapture={armed:false,player:Number(b.dataset.padPlayer),action:b.dataset.action as Action,button:b};});
  bind('reset-key',()=>{input.onCancelCapture=()=>{$('reset-key').textContent='REINICIAR TREINO: '+keyName(p.reset);};input.capture=code=>{const error=keyConflict(p.keys,code);if(error){$('conflicts').textContent=error;$('reset-key').textContent='REINICIAR TREINO: '+keyName(p.reset);return;}p.reset=code;$('reset-key').textContent=`REINICIAR TREINO: ${keyName(code)}`;input.save();conflict();};$('reset-key').textContent='PRESSIONE UMA TECLA';});
  for(const [id,key] of [['volume','volume'],['deadzone','deadzone']] as const)$(id).oninput=e=>{p[key]=Number((e.target as HTMLInputElement).value);input.save();syncAudio();};
  for(const [id,key] of [['shake','shake'],['flashes','reduceFlash'],['accessible','accessible'],['blood','blood']] as const)$(id).onchange=e=>{p[key]=(e.target as HTMLInputElement).checked;input.save();};
}
function tick(force=false){
  const inputs=input.read();if(paused&&!force)return;if(shortcut.length)inputs[0]=shortcut.shift()!;
  if(mode==='ai')inputs[1]=ai.step(sim,1);
  if(mode==='training'){
    const dummy=sim.training!.dummy;
    if(dummy==='ai')inputs[1]=ai.step(sim,1);
    else {inputs[1]=neutral();if(dummy==='jump')inputs[1].up=true;if(dummy==='block'){inputs[1][sim.fighters[1].facing===1?'left':'right']=true;inputs[1].down=sim.fighters[0].move?.height==='low';}}
  }
  sim.step(inputs);scene.consume(sim.events);sim.events.forEach(e=>audio.play(e));
  if(sim.phase==='result')result();
}
const menuNavigation=installNavigation(overlay,()=>!input.capture&&!padCapture&&(screen!=='fight'||paused),()=>{if(padCapture){padCapture.button.textContent='CANCELADO';padCapture=null;return;}const back=overlay.querySelector<HTMLButtonElement>('#guide-back,#preview-close,#settings-back,#lab-done,#back,#result-menu,#resume');if(back)back.click();else if(screen==='selection')menu();});
scene.onTick=dt=>{
  scene.blood=input.prefs.blood;const winner=sim.winner??0;scene.finisherHint=input.prefs.devices[winner]==='keyboard'?keyName(input.prefs.keys[winner].hp)+' + '+keyName(input.prefs.keys[winner].hk):'B'+input.prefs.buttons[winner].hp+' + B'+input.prefs.buttons[winner].hk;
  scene.visualPaused=screen==='fight'&&paused||screen==='settings'||screen==='training-options'||screen==='gallery'||screen==='guide';
  scene.reduceFlash=input.prefs.reduceFlash;scene.shake=input.prefs.shake&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  menuNavigation();
  if(padCapture){const pad=input.pads().find(p=>input.prefs.devices[padCapture!.player]===`pad:${p.index}`);const n=pad?.buttons.findIndex(b=>b.pressed)??-1;if(!padCapture.armed){if(n<0)padCapture.armed=true;return;}if(n>=0){if(n===9||ACTIONS.some(a=>a!==padCapture!.action&&input.prefs.buttons[padCapture!.player][a]===n)){padCapture.button.textContent='B'+input.prefs.buttons[padCapture.player][padCapture.action];$('conflicts').textContent='Botao reservado ou ja atribuido a outra acao.';padCapture=null;return;}input.prefs.buttons[padCapture.player][padCapture.action]=n;padCapture.button.textContent=`B${n}`;input.save();padCapture=null;}}
  if(screen!=='fight'||paused){input.read();return;}
  scene.reduceFlash=input.prefs.reduceFlash;scene.shake=input.prefs.shake;
  accumulator+=Math.min(dt,160)*(sim.training?.speed??1);let updates=0;
  while(accumulator>=1000/C.hz&&updates<C.maxUpdates&&screen==='fight'&&!paused){tick();accumulator-=1000/C.hz;updates++;}
  if(updates===C.maxUpdates)accumulator=0;
};
input.isGameplay=()=>screen==='fight';
input.onPause=()=>{if(padCapture){padCapture.button.textContent='B'+input.prefs.buttons[padCapture.player][padCapture.action];padCapture=null;}else togglePause();};input.onSuspend=()=>togglePause(true);input.onReset=resetTraining;input.onStep=stepOne;
input.onConfirm=()=>{if(screen==='menu')selection();else if(screen==='selection')start();else if(screen==='result')start();else if(paused&&screen==='fight')togglePause();};
input.onShortcut=id=>{
  if(screen!=='fight'||paused||!(mode==='training'||input.prefs.accessible))return;
  const helper=new AI();helper.motion(sim.fighters[0].facing,id==='super'?[2,3,6,2,3,6]:id==='uppercut'?[6,2,3]:id==='advance'?[2,1,4]:[2,3,6],id!=='advance');shortcut=helper.sequence;
};
input.onPadChange=()=>{if(screen==='selection')selection();else if(screen==='settings'){const fields=overlay.querySelector('.device-fields');if(fields){fields.outerHTML=deviceFields(input);bindDevices(overlay,input);}}const count=Array.from(navigator.getGamepads?.()??[]).filter(Boolean).length;$('pads').textContent=count?`${count} CONTROLE${count>1?'S':''} CONECTADO${count>1?'S':''}`:'TECLADO CONECTADO';};
bind('sound',()=>{audio.unlock();input.prefs.mute=!input.prefs.mute;input.save();syncAudio();});
bind('home',menu);syncAudio();input.onPadChange();
async function boot(){
  setOverlay('<div class="settings"><h2>FIGHT NERDS</h2><p id="loading-status" role="status">CARREGANDO...</p></div>','solid-screen');
  scene.onReady=menu;
  await Promise.all(STAGES.map(async s=>{try{const r=await fetch(`/assets/stages/${s.id}.png`,{method:'HEAD'});if(r.ok&&r.headers.get('content-type')?.startsWith('image/'))scene.availableStages.add(s.id);}catch{/* Procedural stage is always available. */}}));
  const renderScale=()=>Math.min(2,Math.max(1,Math.ceil(Math.min($('game').clientWidth/C.width,$('game').clientHeight/C.height)*(window.devicePixelRatio||1)*4)/4));
  const initialScale=renderScale();
  const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:C.width*initialScale,height:C.height*initialScale,pixelArt:false,antialias:true,backgroundColor:'#151823',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[scene],audio:{noAudio:true}});
  window.addEventListener('resize',()=>{const scale=renderScale();if(game.scale.width!==C.width*scale){game.scale.setGameSize(C.width*scale,C.height*scale);if(scene.ready)scene.setRenderScale(scale);}});
}
void boot();
// Read-only access to the running instance for local development and browser QA.
export function inspect(){return {sim,screen,paused,input,scene};}
if(import.meta.env.DEV)Object.defineProperty(window,'__fightNerds',{value:{inspect},configurable:true});
