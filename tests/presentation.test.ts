import { afterEach,describe,expect,it,vi } from 'vitest';
import { ArenaCamera } from '../src/rendering/camera';
import { FighterAnimation } from '../src/rendering/animation';
import { fighterAssets } from '../src/data/assets';
import { Simulation } from '../src/combat/simulation';
import { InputManager, loadPreferences } from '../src/input/manager';
import { keyConflict } from '../src/input/preferences';
afterEach(()=>vi.unstubAllGlobals());
describe('presentation and preferences',()=>{
  it('camera stays stable in the centre, freezes and keeps both fighters visible',()=>{const c=new ArenaCamera();c.update(400,800,16);const before=c.x;c.update(500,900,16);expect(c.x).toBe(before);const x=c.x;c.update(600,1000,16,true);expect(c.x).toBe(x);c.update(490,1350,16);expect((490-c.x)*c.zoom).toBeGreaterThanOrEqual(30);expect((1350-c.x)*c.zoom).toBeLessThanOrEqual(930);c.update(34,1406,16);expect(c.zoom).toBeLessThan(1);expect((34-c.x)*c.zoom).toBeGreaterThan(0);expect((1406-c.x)*c.zoom).toBeLessThan(960);});
  it('malformed and conflicting persisted controls fall back safely',()=>{vi.stubGlobal('localStorage',{getItem:()=>'{broken'});const defaults=loadPreferences();const saved=structuredClone(defaults);saved.keys[1].left=saved.keys[0].left;saved.volume=99;saved.deadzone=-2;saved.devices=['pad:3','pad:3'];vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify(saved)});const p=loadPreferences();expect(p.keys).toEqual(defaults.keys);expect(p.volume).toBe(1);expect(p.deadzone).toBe(.1);expect(p.devices).toEqual(['pad:3','keyboard']);});
  it('rejects an opponent key and interface shortcuts',()=>{vi.stubGlobal('localStorage',{getItem:()=>null});const p=loadPreferences();expect(keyConflict(p.keys,'KeyJ',0,'lp')).toBeTruthy();expect(keyConflict(p.keys,'Escape',0,'lp')).toBeTruthy();expect(keyConflict(p.keys,'Digit1',0,'lp')).toBeTruthy();expect(keyConflict(p.keys,'KeyF',0,'lp')).toBeNull();});
  it('each of 22 attacks has eight unique poses and holds contact during active frames',()=>{for(const id of ['kaio','luma'] as const){const sim=new Simulation([id,id]),f=sim.fighters[0];const keys=Object.keys(fighterAssets[id].animations).filter(k=>/^(stand|crouch|air)_(lp|mp|hp|lk|mk|hk)$/.test(k)||['projectile','uppercut','advance','super'].includes(k));expect(keys).toHaveLength(22);const frames=keys.flatMap(k=>fighterAssets[id].animations[k].frames);expect(new Set(frames).size).toBe(176);const a=new FighterAnimation();sim.startMove(f,'stand_hp');f.attackFrame=f.move!.startup;const contact=a.frame(f,1);f.attackFrame++;expect(a.frame(f,2)).toBe(contact);f.attackFrame=f.move!.startup+f.move!.active+f.move!.recovery-1;expect(a.frame(f,3)).not.toBe(contact);}});
  it('victory advances even when combat stateFrame is stopped',()=>{const f=new Simulation().fighters[0],a=new FighterAnimation();f.state='victory';const first=a.frame(f,10);expect(a.frame(f,25)).not.toBe(first);expect(f.stateFrame).toBe(0);});
  it('USB and Bluetooth gamepads work automatically without manual device selection',()=>{
    vi.stubGlobal('window',{addEventListener:()=>{}});vi.stubGlobal('document',{addEventListener:()=>{},hidden:false});vi.stubGlobal('localStorage',{getItem:()=>null,setItem:()=>{}});
    const buttons=(pressed:Record<number,number|{pressed:boolean;value:number}>={})=>Array.from({length:17},(_,i)=>{const v=pressed[i];return typeof v==='number'?{pressed:v>.5,value:v}:v??{pressed:false,value:0};});
    const pad0={index:0,id:'Xbox Bluetooth',connected:true,mapping:'standard',axes:[0,0],buttons:buttons({0:1,6:.8})};
    const pad1={index:1,id:'USB DirectInput',connected:true,mapping:'',axes:[0,0,0,0,0,0,0,0,0,-.42857],buttons:buttons({1:1,7:.9})};
    vi.stubGlobal('navigator',{getGamepads:()=>[pad0,pad1]});
    const mgr=new InputManager();const [p1,p2]=mgr.read();
    expect(p1.lp).toBe(true);expect(p1.hp).toBe(true);
    expect(p2.lk).toBe(true);expect(p2.hk).toBe(true);expect(p2.right).toBe(true);
  });
});
