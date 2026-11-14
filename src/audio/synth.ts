import type { Event } from '../combat/types';
export class Synth {
  context:AudioContext|null=null; volume=.35; muted=false;
  unlock(){try{this.context??=new AudioContext();void this.context.resume().catch(()=>{});}catch{/* Muted fallback on browsers without Web Audio. */}}
  play(event:Event){
    if(!this.context||this.muted||this.context.state!=='running')return;
    const ctx=this.context,t=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
    const frequencies={hit:110,block:250,parry:1100,throw:85,tech:760,super:65,ko:170,round:440,projectile:340,whiff:440,land:55,dash:180,finisher:48,blood:60};
    osc.type=event.type==='parry'?'sine':'triangle';osc.frequency.setValueAtTime(frequencies[event.type],t);osc.frequency.exponentialRampToValueAtTime(event.type==='parry'?1800:40,t+.15);
    const duration=event.type==='whiff'?.07:event.type==='super'||event.type==='finisher'?.5:event.type==='parry'?.28:.16;
    gain.gain.setValueAtTime(this.volume*(event.type==='whiff'?.09:.3),t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+duration+.01);
  }
}
