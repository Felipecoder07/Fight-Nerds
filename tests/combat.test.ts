import { describe,it,expect } from 'vitest';
import { Simulation } from '../src/combat/simulation';
import { command, direction } from '../src/input/commands';
import { neutral, type Input, type RecordFrame } from '../src/combat/types';
import { MOVES } from '../src/data/moves';
import { C } from '../src/data/config';
import { AI } from '../src/ai/controller';
const input=(extra:Partial<Input>={}):Input=>({...neutral(),...extra});
function fight(){const s=new Simulation();s.phase='fight';s.fighters[0].x=600;s.fighters[1].x=675;return s;}
function frames(s:Simulation,n:number,inputs:[Input,Input]=[neutral(),neutral()]){for(let i=0;i<n;i++)s.step(inputs);}
function history(dirs:number[]):RecordFrame[]{return dirs.map((dir,i)=>({dir,frame:1+i*2,pressed:[]}));}
describe('comandos relativos e buffer',()=>{
  it.each([1,-1])('reconhece todos os especiais do lado %s',facing=>{
    const relative=(dirs:number[])=>dirs.map(d=>direction(facing===1?d===1||d===4:d===3||d===6,facing===1?d===3||d===6:d===1||d===4,false,d<=3,facing));
    expect(command(history(relative([2,3,6])),7,true,false,0)).toBe('projectile');
    expect(command(history(relative([6,2,3])),7,true,false,0)).toBe('uppercut');
    expect(command(history(relative([2,1,4])),7,false,true,0)).toBe('advance');
    expect(command(history(relative([2,3,6,2,3,6])),13,true,false,100)).toBe('super');
  });
  it('prioriza super, rejeita comandos expirados e exige medidor',()=>{
    const h=history([2,3,6,2,3,6]);expect(command(h,13,true,false,100)).toBe('super');
    expect(command(h,13,true,false,0)).toBe('projectile');expect(command(h,80,true,false,100)).toBeNull();
  });
  it('não repete ataque com botão mantido',()=>{
    const s=fight();frames(s,90,[input({lp:true}),neutral()]);expect(s.fighters[1].hp).toBe(1000-MOVES.kaio.stand_lp.damage);
  });
});
describe('contatos e defesa',()=>{
  it('aplica um único dano por instância',()=>{
    const s=fight();s.startMove(s.fighters[0],'stand_mp');frames(s,35);
    expect(s.fighters[1].hp).toBe(1000-MOVES.kaio.stand_mp.damage);
  });
  it.each([['stand_lp',false,true],['crouch_lk',true,true],['crouch_lk',false,false],['air_lp',true,false],['air_lp',false,true]] as const)('%s agachado=%s bloqueia=%s',(move,down,blocked)=>{
    const s=fight();s.startMove(s.fighters[0],move);frames(s,24,[neutral(),input({right:true,down})]);expect(s.fighters[1].hp===1000).toBe(blocked);
  });
  it('parry por toque anula dano; segurar não renova a janela',()=>{
    const s=fight();s.fighters[1].x=668;s.step([neutral(),input({left:true})]);s.contact(0,1,MOVES.kaio.stand_lp,input({left:true}));
    expect(s.fighters[1].hp).toBe(1000);expect(s.events.some(e=>e.type==='parry')).toBe(true);
    frames(s,40,[neutral(),input({left:true})]);s.contact(0,1,MOVES.kaio.stand_lp,input({left:true}));expect(s.fighters[1].hp).toBeLessThan(1000);
  });
  it('parry baixo exige toque para baixo',()=>{
    const s=fight();s.step([neutral(),input({down:true})]);s.contact(0,1,MOVES.kaio.crouch_lk,input({down:true}));expect(s.fighters[1].hp).toBe(1000);
  });
  it.each([C.parryWindow,C.parryWindow+1])('respeita limite da janela de parry no frame %s',n=>{
    const s=fight();frames(s,n,[neutral(),input({left:true})]);s.contact(0,1,MOVES.kaio.stand_lp,input({left:true}));expect(s.fighters[1].hp===1000).toBe(n<=C.parryWindow);
  });
  it('dano residual não causa KO',()=>{
    const s=fight();s.fighters[1].hp=2;s.contact(0,1,MOVES.kaio.projectile,input({right:true}));expect(s.fighters[1].hp).toBe(1);
  });
  it('permite troca de golpes simultâneos',()=>{
    const s=fight();s.startMove(s.fighters[0],'stand_lp');s.startMove(s.fighters[1],'stand_lp');s.fighters.forEach(f=>f.attackFrame=3);frames(s,1);expect(s.fighters.every(f=>f.hp<1000)).toBe(true);
  });
  it('hitstun impede movimentação e ataques',()=>{
    const s=fight();s.contact(0,1,MOVES.kaio.stand_hp,neutral());s.freeze=0;frames(s,3,[neutral(),input({left:true,hp:true})]);expect(s.fighters[1].state).toBe('hitstun');expect(s.fighters[1].move).toBeNull();
  });
  it('invulnerabilidade só existe nos frames declarados',()=>{
    const s=fight();s.startMove(s.fighters[1],'uppercut');s.contact(0,1,MOVES.kaio.stand_hp,neutral());expect(s.fighters[1].hp).toBe(1000);s.fighters[1].attackFrame=12;s.contact(0,1,MOVES.kaio.stand_hp,neutral());expect(s.fighters[1].hp).toBeLessThan(1000);
  });
});
describe('agarrão, super e rounds',()=>{
  it('cobra super apenas ao iniciar com medidor suficiente',()=>{
    const s=fight(),f=s.fighters[0];f.meter=99;expect(s.startMove(f,'super')).toBe(false);expect(f.meter).toBe(99);f.meter=100;expect(s.startMove(f,'super')).toBe(true);expect(f.meter).toBe(0);expect(s.freeze).toBe(C.superFreeze);
  });
  it('proíbe super durante hitstun sem consumir medidor',()=>{
    const s=fight(),f=s.fighters[0];f.meter=100;f.state='hitstun';f.stun=20;expect(s.startMove(f,'super')).toBe(false);expect(f.meter).toBe(100);
  });
  it('super produz quatro impactos com escalonamento',()=>{
    const s=fight();s.fighters[0].meter=100;s.startMove(s.fighters[0],'super');frames(s,100);expect(s.fighters[1].lastCombo||s.fighters[1].combo).toBe(4);expect(1000-s.fighters[1].hp).toBeLessThan(MOVES.kaio.super.damage*4);
  });
  it('permite escape de agarrão dentro da janela',()=>{
    const s=fight();s.startMove(s.fighters[0],'throw');frames(s,3);expect(s.fighters[1].state).toBe('thrown');s.step([neutral(),input({lp:true,lk:true})]);expect(s.events.some(e=>e.type==='tech')).toBe(true);expect(s.fighters[1].hp).toBe(1000);expect(s.fighters[1].protection).toBeGreaterThan(0);
  });
  it('agarrão causa dano após janela e protege ao levantar',()=>{
    const s=fight();s.startMove(s.fighters[0],'throw');frames(s,20);expect(s.fighters[1].hp).toBe(1000-C.throwDamage);expect(s.fighters[1].state).toBe('knockdown');frames(s,70);expect(s.fighters[1].state).toBe('idle');
  });
  it('pontua KO apenas uma vez e preserva super',()=>{
    const s=fight();s.fighters[0].meter=42;s.fighters[1].hp=0;frames(s,1);expect(s.fighters[0].wins).toBe(1);frames(s,C.outro);expect(s.fighters[0].wins).toBe(1);expect(s.fighters[0].meter).toBe(42);expect(s.fighters[1].hp).toBe(1000);
  });
  it('double KO repete e dois empates ativam morte súbita',()=>{
    const s=fight();for(let i=0;i<2;i++){s.phase='fight';s.fighters.forEach(f=>f.hp=0);frames(s,1);expect(s.winner).toBeNull();frames(s,C.outro);}
    expect(s.draws).toBe(2);expect(s.fighters.every(f=>f.hp===150)).toBe(true);expect(s.fighters.every(f=>f.wins===0)).toBe(true);
  });
  it('tempo esgotado decide pela vida; empate não pontua',()=>{
    const s=fight();s.activeFrames=C.roundFrames-1;s.fighters[1].hp=900;frames(s,1);expect(s.winner).toBe(0);expect(s.reason).toBe('TEMPO ESGOTADO');
    const tie=fight();tie.activeFrames=C.roundFrames-1;frames(tie,1);expect(tie.winner).toBeNull();
  });
  it('cronômetro não avança na introdução nem no hitstop',()=>{
    const s=new Simulation();frames(s,100);expect(s.activeFrames).toBe(0);s.phase='fight';s.freeze=20;frames(s,20);expect(s.activeFrames).toBe(0);
  });
  it('pushboxes não aceleram a gravidade e permitem cruzamento alto',()=>{
    const s=fight();s.fighters[0].x=650;s.fighters[0].y=300;s.fighters[0].vy=0;s.fighters[0].state='jump';frames(s,1);expect(s.fighters[0].vy).toBe(C.gravity);
    const grounded=fight();grounded.fighters[0].x=34;grounded.fighters[1].x=35;grounded.pushboxes();expect(grounded.fighters[1].x-grounded.fighters[0].x).toBe(C.push*2);
  });
  it('encerra partida após dois pontos',()=>{
    const s=fight();s.fighters[0].wins=1;s.fighters[1].hp=0;frames(s,C.outro+1);expect(s.phase).toBe('result');
  });
});
describe('determinismo e integridade dos dados',()=>{
  it('afastar J1 não arrasta J2 no limite da câmera',()=>{
    const s=fight();s.fighters[0].x=200;s.fighters[1].x=1050;
    frames(s,30,[input({left:true}),neutral()]);expect(s.fighters[1].x).toBe(1050);expect(s.fighters[0].x).toBeLessThan(200);
  });
  it('afastar J2 não arrasta J1 no limite da câmera',()=>{
    const s=fight();s.fighters[0].x=200;s.fighters[1].x=1050;
    frames(s,30,[neutral(),input({right:true})]);expect(s.fighters[0].x).toBe(200);expect(s.fighters[1].x).toBeGreaterThan(1050);
  });
  it('mesmas entradas e seed produzem o mesmo combate',()=>{
    const a=fight(),b=fight(),aa=new AI('difícil'),ab=new AI('difícil');
    for(let i=0;i<3000;i++){const p=input({right:i%120<35,lp:i%29===0,up:i%121===0});a.step([p,aa.step(a,1)]);b.step([p,ab.step(b,1)]);}
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
  it('cada lutador possui 18 normais, três golpes direcionais e cinco especiais',()=>{
    Object.values(MOVES).forEach(moves=>{expect(Object.keys(moves).filter(k=>/^(stand|crouch|air)_/.test(k))).toHaveLength(18);expect(['overhead','launcher','spin_kick'].every(k=>!!moves[k])).toBe(true);expect(Object.values(moves).filter(m=>m.special)).toHaveLength(5);expect(new Set(Object.values(moves).filter(m=>m.id.startsWith('stand_')).map(m=>`${m.startup}/${m.damage}/${m.boxes[0].box.w}`)).size).toBe(6);});
  });
});
