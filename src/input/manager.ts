import { reservedKeys } from './preferences';
import { ACTIONS, neutral, type Action, type Input } from '../combat/types';
export interface Preferences { keys:Record<Action,string>[]; buttons:Record<Action,number>[]; deadzone:number; reset:string; volume:number; mute:boolean; shake:boolean; reduceFlash:boolean; accessible:boolean; devices:string[]; blood:boolean }
const keyRows=[['KeyA','KeyD','KeyW','KeyS','KeyF','KeyG','KeyH','KeyV','KeyB','KeyN'],['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyJ','KeyK','KeyL','KeyU','KeyI','KeyO']];
const defaults:Preferences={keys:keyRows.map(row=>Object.fromEntries(ACTIONS.map((a,i)=>[a,row[i]])) as Record<Action,string>),buttons:[0,1].map(()=>Object.fromEntries(ACTIONS.map((a,i)=>[a,[14,15,12,13,0,2,4,1,3,5][i]])) as Record<Action,number>),deadzone:.25,reset:'KeyR',volume:.35,mute:false,shake:true,reduceFlash:false,accessible:false,devices:['keyboard','keyboard'],blood:true};
export function loadPreferences():Preferences {
  const p=structuredClone(defaults);try{
    const s=JSON.parse(localStorage.getItem('fight-nerds-settings')??'null');if(!s)return p;
    if(Array.isArray(s.keys)&&s.keys.length===2&&s.keys.every((m:Record<string,unknown>)=>m&&ACTIONS.every(a=>typeof m[a]==='string'&&/^(Key[A-Z]|Arrow(Left|Right|Up|Down)|Digit[0-9]|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right)|Numpad[0-9]|Comma|Slash|Semicolon|Quote|BracketLeft|BracketRight|Backslash|Minus|Equal)$/.test(m[a] as string)))){
      const all=s.keys.flatMap(Object.values) as string[];if(new Set(all).size===20&&!all.some(k=>reservedKeys.includes(k)))p.keys=s.keys;
    }
    if(Array.isArray(s.buttons)&&s.buttons.length===2)s.buttons.forEach((m:Record<string,number>,i:number)=>{if(m&&ACTIONS.every(a=>Number.isInteger(m[a])&&m[a]>=0&&m[a]<32&&m[a]!==9)&&new Set(ACTIONS.map(a=>m[a])).size===10)p.buttons[i]=m;});
    for(const key of ['volume','deadzone'] as const)if(typeof s[key]==='number'&&Number.isFinite(s[key]))p[key]=Math.max(key==='volume'?0:.1,Math.min(key==='volume'?1:.8,s[key]));
    for(const key of ['mute','shake','reduceFlash','accessible','blood'] as const)if(typeof s[key]==='boolean')p[key]=s[key];
    if(typeof s.reset==='string'&&/^Key[A-Z]$/.test(s.reset)&&!p.keys.flatMap(Object.values).includes(s.reset))p.reset=s.reset;
    if(p.keys.flatMap(Object.values).includes(p.reset))p.keys=structuredClone(defaults.keys);
    if(Array.isArray(s.devices)&&s.devices.length===2&&s.devices.every((d:unknown)=>d==='keyboard'||typeof d==='string'&&/^pad:[0-9]+$/.test(d))){p.devices=s.devices;if(p.devices[0]!=='keyboard'&&p.devices[0]===p.devices[1])p.devices[1]='keyboard';}
  }catch{/* Malformed or unavailable storage uses defaults. */}return p;
}
export class InputManager {
  prefs=loadPreferences(); held=new Set<string>(); usedPads=new Set<number>(); blockedPads=new Set<number>(); padStart=false; capture:((code:string)=>void)|null=null;
  isGameplay=()=>true;onCancelCapture=()=>{};lostPads=new Set<number>();lastPadSignature='';
  onPause=()=>{}; onSuspend=()=>{}; onReset=()=>{}; onStep=()=>{}; onConfirm=()=>{}; onPadChange=()=>{}; onShortcut=(_id:string)=>{};
  constructor(){
    this.lastPadSignature=this.pads().map(p=>`${p.index}:${p.id}`).join('|');
    window.addEventListener('keydown',e=>{
      if((e.target as HTMLElement)?.matches('input,select,textarea'))return;
      if(this.capture){e.preventDefault();const cb=this.capture;this.capture=null;if(e.code==='Escape')this.onCancelCapture();else cb(e.code);return;}
      if([...this.prefs.keys.flatMap(Object.values),'Space','Escape','Enter','Period',this.prefs.reset,'Digit1','Digit2','Digit3','Digit4'].includes(e.code))e.preventDefault();
      if(e.repeat)return;if(this.isGameplay())this.held.add(e.code);
      if(e.code==='Escape')this.onPause();if(e.code===this.prefs.reset)this.onReset();if(e.code==='Period')this.onStep();if(e.code==='Enter')this.onConfirm();
      const special:Record<string,string>={Digit1:'projectile',Digit2:'uppercut',Digit3:'advance',Digit4:'super'};if(special[e.code])this.onShortcut(special[e.code]);
    });
    window.addEventListener('keyup',e=>this.held.delete(e.code));
    window.addEventListener('blur',()=>{this.clear();this.onSuspend();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){this.clear();this.onSuspend();}});
    window.addEventListener('gamepadconnected',()=>{this.lastPadSignature=this.pads().map(p=>`${p.index}:${p.id}`).join('|');this.onPadChange();});
    window.addEventListener('gamepaddisconnected',e=>{const i=(e as GamepadEvent).gamepad.index;if(this.prefs.devices.includes(`pad:${i}`)){this.lostPads.add(i);this.onSuspend();}this.clear();this.lastPadSignature=this.pads().map(p=>`${p.index}:${p.id}`).join('|');this.onPadChange();});
  }
  restore(){this.prefs=structuredClone(defaults);this.lostPads.clear();this.clear();this.save();}
  save(){try{localStorage.setItem('fight-nerds-settings',JSON.stringify(this.prefs));}catch{/* Private mode can disable storage; session preferences still work. */}}
  clear(){this.held.clear();this.pads().forEach(p=>{if(p.buttons.some((b,idx)=>idx<=5&&b.pressed))this.blockedPads.add(p.index);});}
  pads(){return Array.from(navigator.getGamepads?.()??[]).filter((p):p is Gamepad=>!!p&&p.connected!==false);}
  padForPlayer(player:number):Gamepad|undefined{
    const pads=this.pads(),dev=this.prefs.devices[player];
    if(dev!=='keyboard'){const idx=Number(dev.slice(4));return this.lostPads.has(idx)?undefined:pads.find(p=>p.index===idx);}
    const unassigned=pads.filter(p=>!this.prefs.devices.includes(`pad:${p.index}`)&&!this.lostPads.has(p.index));
    const keyboardSlots=[0,1].filter(i=>this.prefs.devices[i]==='keyboard');
    const pos=keyboardSlots.indexOf(player);
    return pos>=0?unassigned[pos]:undefined;
  }
  assign(player:number,source:string):string|null{
    if(source!=='keyboard'&&this.prefs.devices[1-player]===source)return 'Controle ja atribuido ao outro jogador.';
    if(source!=='keyboard'&&!this.pads().some(p=>source===`pad:${p.index}`))return 'Controle desconectado.';
    this.prefs.devices[player]=source;this.lostPads.delete(Number(source.slice(4)));this.clear();this.save();return null;
  }
  ready(){return this.prefs.devices.every(d=>d==='keyboard'||!this.lostPads.has(Number(d.slice(4)))&&this.pads().some(p=>d===`pad:${p.index}`));}
  read():[Input,Input]{
    const pads=this.pads(),sig=pads.map(p=>`${p.index}:${p.id}`).join('|');
    if(sig!==this.lastPadSignature){this.lastPadSignature=sig;this.onPadChange();}
    const result=this.prefs.keys.map((mapping,index)=>{const i=neutral();if(this.prefs.devices[index]==='keyboard')ACTIONS.forEach(a=>i[a]=this.held.has(mapping[a]));return i;}) as [Input,Input];
    let start=false;
    pads.forEach(p=>{start ||= !!p.buttons[9]?.pressed;});
    for(const index of [0,1] as const){
      const pad=this.padForPlayer(index);if(!pad)continue;
      const mapping=this.prefs.buttons[index];
      const attackBtns=['lp','mp','hp','lk','mk','hk'].map(a=>mapping[a as Action]);
      if(this.blockedPads.has(pad.index)){
        if(!attackBtns.some(b=>pad.buttons[b]?.pressed)&&!pad.buttons[0]?.pressed)this.blockedPads.delete(pad.index);
      }
      const blocked=this.blockedPads.has(pad.index),i=result[index],usedBtns=Object.values(mapping);
      ACTIONS.forEach(a=>{
        if(blocked&&['lp','mp','hp','lk','mk','hk'].includes(a))return;
        const btn=pad.buttons[mapping[a]];
        i[a] ||= !!(btn&&(btn.pressed||btn.value>.5));
      });
      if(!blocked){
        if(!usedBtns.includes(6)&&(pad.buttons[6]?.pressed||(pad.buttons[6]?.value??0)>.5))i.hp=true;
        if(!usedBtns.includes(7)&&(pad.buttons[7]?.pressed||(pad.buttons[7]?.value??0)>.5))i.hk=true;
      }
      if(!usedBtns.includes(14)&&pad.buttons[14]?.pressed)i.left=true;
      if(!usedBtns.includes(15)&&pad.buttons[15]?.pressed)i.right=true;
      if(!usedBtns.includes(12)&&pad.buttons[12]?.pressed)i.up=true;
      if(!usedBtns.includes(13)&&pad.buttons[13]?.pressed)i.down=true;
      i.left ||= (pad.axes[0]??0)<-this.prefs.deadzone;i.right ||= (pad.axes[0]??0)>this.prefs.deadzone;
      i.up ||= (pad.axes[1]??0)<-this.prefs.deadzone;i.down ||= (pad.axes[1]??0)>this.prefs.deadzone;
      if(pad.mapping!=='standard'){
        if(pad.axes.length>=8){
          i.left ||= (pad.axes[6]??0)<-this.prefs.deadzone;i.right ||= (pad.axes[6]??0)>this.prefs.deadzone;
          i.up ||= (pad.axes[7]??0)<-this.prefs.deadzone;i.down ||= (pad.axes[7]??0)>this.prefs.deadzone;
        }
        const hat=pad.axes[9];
        if(typeof hat==='number'&&Math.abs(hat)>.05&&Math.abs(hat)<=1.05){
          const dir=Math.round((hat+1)*3.5);
          if(dir===0||dir===1||dir===7)i.up=true;
          if(dir===1||dir===2||dir===3)i.right=true;
          if(dir===3||dir===4||dir===5)i.down=true;
          if(dir===5||dir===6||dir===7)i.left=true;
        }
      }
      if(ACTIONS.some(a=>i[a]))this.usedPads.add(pad.index);
    }
    if(start&&!this.padStart){if(this.isGameplay())this.onPause();else this.onConfirm();}
    this.padStart=start;
    return result;
  }
}
