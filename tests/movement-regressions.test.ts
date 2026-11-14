import { describe,it,expect } from 'vitest';
import { Simulation } from '../src/combat/simulation';
import { neutral,type Input } from '../src/combat/types';
import { C } from '../src/data/config';
import { MOVES } from '../src/data/moves';
import { ArenaCamera } from '../src/rendering/camera';
const input=(extra:Partial<Input>)=>({...neutral(),...extra});
const step=(s:Simulation,n:number,inputs:[Input,Input]=[neutral(),neutral()])=>{for(let i=0;i<n;i++)s.step(inputs);};
function fight(){const s=new Simulation();s.phase='fight';return s;}
describe('movement and hit responsiveness',()=>{
  it('a retreat in the centre never appears to move forward when the opponent follows',()=>{
    const camera=new ArenaCamera();let a=650,b=850;camera.update(a,b,16.6667);
    let previous=(a-camera.x)*camera.zoom;
    for(let n=0;n<50;n++){a-=2.7;b-=4.6;camera.update(a,b,16.6667);const current=(a-camera.x)*camera.zoom;expect(current).toBeLessThan(previous);previous=current;}
  });
  it.each([0,1])('player %s can retreat from contact while the opponent follows',i=>{
    const s=fight();s.fighters[0].x=650;s.fighters[1].x=650+C.push*2;
    const direction=i===0?'left':'right';const inputs:[Input,Input]=[input({[direction]:true}),input({[direction]:true})];
    for(let n=0;n<60;n++){const previous=s.fighters[i].x;s.step(inputs);expect((s.fighters[i].x-previous)*(i===0?-1:1)).toBeGreaterThan(0);}
  });
  it.each([0,1])('contact cannot drag idle player %s',i=>{const s=fight();s.fighters[0].x=600;s.fighters[1].x=600+C.push*2;const x=s.fighters[i].x;const inputs:[Input,Input]=[neutral(),neutral()];inputs[1-i]=input(i===0?{left:true}:{right:true});step(s,120,inputs);expect(s.fighters[i].x).toBe(x);expect(s.fighters[1].x-s.fighters[0].x).toBe(C.push*2);});
  it('releasing a dash stops immediately',()=>{const s=fight(),f=s.fighters[0];s.step([input({right:true}),neutral()]);s.step([neutral(),neutral()]);s.step([input({right:true}),neutral()]);expect(f.state).toBe('dash');const x=f.x;step(s,30);expect(f.x).toBe(x);expect(f.state).toBe('idle');});
  it('reversing a dash responds immediately',()=>{const s=fight(),f=s.fighters[0];s.step([input({right:true}),neutral()]);s.step([neutral(),neutral()]);s.step([input({right:true}),neutral()]);const x=f.x;s.step([input({left:true}),neutral()]);expect(f.x).toBeLessThan(x);expect(f.state).toBe('walk');});
  it('both players can retreat to the real arena walls without dragging each other',()=>{const s=fight();step(s,600,[input({left:true}),input({right:true})]);expect(s.fighters.map(f=>f.x)).toEqual([C.push,C.arena-C.push]);});
  it.each([0,1])('a grounded normal never pushes its owner backwards: player %s',i=>{const s=fight(),f=s.fighters[i],x=f.x;s.startMove(f,'stand_hp');step(s,50);expect(f.x).toBe(x);expect(f.state).toBe('idle');});
  it('keeps a released attack tap through a long hitstop',()=>{const s=fight();s.freeze=20;s.step([input({lp:true}),neutral()]);step(s,19);expect(s.fighters[0].move).toBeNull();s.step([neutral(),neutral()]);expect(s.fighters[0].move?.id).toBe('stand_lp');});
  it('keeps a special motion through hitstop without extending it afterwards',()=>{const s=fight();s.step([input({down:true}),neutral()]);s.step([input({down:true,right:true}),neutral()]);s.freeze=15;s.step([input({right:true,lp:true}),neutral()]);step(s,14);s.step([neutral(),neutral()]);expect(s.fighters[0].move?.id).toBe('projectile');});
  it('returns movement on the same frame hitstun ends',()=>{const s=fight(),f=s.fighters[1];s.contact(0,1,MOVES.kaio.stand_lp,neutral());s.freeze=0;f.stun=1;f.vx=0;const x=f.x;s.step([neutral(),input({right:true})]);expect(f.state).toBe('walk');expect(f.x).toBeGreaterThan(x);});
  it('uses a buffered attack on the final recovery frame',()=>{const s=fight(),f=s.fighters[1];f.state='hitstun';f.stun=2;s.step([neutral(),input({lp:true})]);s.step([neutral(),neutral()]);expect(f.move?.id).toBe('stand_lp');});
  it('reversing direction cancels a dash instead of dragging the fighter forward',()=>{const s=fight(),f=s.fighters[0];s.step([input({right:true}),neutral()]);s.step([neutral(),neutral()]);s.step([input({right:true}),neutral()]);expect(f.state).toBe('dash');step(s,3,[input({right:true}),neutral()]);const x=f.x;s.step([input({left:true}),neutral()]);expect(f.state).toBe('walk');expect(f.x).toBeLessThan(x);});
  it('ordinary hits use short feedback pauses, while damage still interrupts the victim',()=>{const s=fight();s.contact(0,1,MOVES.kaio.stand_hp,neutral());expect(s.freeze).toBeLessThanOrEqual(4);expect(s.fighters[1].state).toBe('hitstun');});
});
