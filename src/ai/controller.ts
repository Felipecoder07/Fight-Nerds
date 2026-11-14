import type { Simulation } from '../combat/simulation';
import { neutral, type Input } from '../combat/types';
export type Difficulty='fácil'|'normal'|'difícil';
export class AI {
  held=neutral(); next=0; sequence:Input[]=[];
  constructor(public difficulty:Difficulty='normal'){}
  step(sim:Simulation,index:number):Input {
    if(sim.canFinish&&sim.winner===index&&sim.phaseFrame>=35)return {...neutral(),hp:true,hk:true};
    const f=sim.fighters[index],other=sim.fighters[1-index];
    if(this.sequence.length)return this.sequence.shift()!;
    if(sim.frame<this.next)return {...this.held};
    const level=['fácil','normal','difícil'].indexOf(this.difficulty);
    this.next=sim.frame+[30,19,11][level]+Math.floor(sim.random()*12);
    const input=neutral(),dist=Math.abs(f.x-other.x),forward=f.facing===1?'right':'left',back=f.facing===1?'left':'right',roll=sim.random();
    if(other.state==='attack'&&dist<200&&roll<.3+level*.15){input[back]=true;input.down=sim.random()<.5;}
    else if(other.y<380&&dist<180&&roll<.5){this.motion(f.facing,[6,2,3],true);}
    else if(dist>260&&roll<.35+level*.15){this.motion(f.facing,f.meter>=100?[2,3,6,2,3,6]:[2,3,6],true);}
    else if(dist>100)input[forward]=true;
    else if(roll<.72){const attack=(['lp','mp','hp','lk','mk','hk'] as const)[Math.floor(sim.random()*(level===0?3:6))];input[attack]=true;input.down=sim.random()<.3;}
    else if(roll<.86)input[back]=true;
    else input.up=true;
    this.held=input;return {...input};
  }
  motion(facing:number,dirs:number[],punch:boolean){
    this.sequence=[];
    for(const dir of dirs){const i=neutral();const x=(dir%3===0?1:dir%3===1?-1:0)*facing;i.left=x<0;i.right=x>0;i.down=dir<=3;this.sequence.push({...i},{...i});}
    const last={...this.sequence.at(-1)!};last[punch?'hp':'hk']=true;this.sequence.push(last,neutral());
  }
}
