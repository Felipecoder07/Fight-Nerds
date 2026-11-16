import { FighterAnimation } from '../rendering/animation';
import Phaser from 'phaser';
import { ArenaCamera } from '../rendering/camera';
import { C, FIGHTERS, STAGES } from '../data/config';
import { fighterAssets, stageFloor, assetScale } from '../data/assets';
import { drawFighter } from '../rendering/fighter';
import { hitboxes, hurtbox, type Simulation } from '../combat/simulation';
import type { Event } from '../combat/types';
import { moveShort } from '../ui/moveGuide';
export class ArenaScene extends Phaser.Scene {
  animations = [new FighterAnimation(), new FighterAnimation()]; visualPaused = false; visualCamera = new ArenaCamera(); shakeLife = 0; previousSim: Simulation | null = null; previousRound = 0;
  sim: Simulation | null = null; stage = 0; debug = false; attract = false; reduceFlash = false; shake = true; onTick = (dt: number) => { };
  bg!: Phaser.GameObjects.Graphics; ink!: Phaser.GameObjects.Graphics; hud!: Phaser.GameObjects.Graphics;
  texts: Record<string, Phaser.GameObjects.Text> = {}; effects: (Event & { life: number })[] = []; clock = 0; renderDelta = 1;
  sprites: Phaser.GameObjects.Sprite[] = []; portraitImages: Phaser.GameObjects.Image[] = []; footOrigins = new Map<string, number>(); availableStages = new Set<string>();
  ready = false; onReady = () => { };
  blood=true;finisherHint='HP + HK';comboReadouts=[{text:'',until:0},{text:'',until:0}];
  constructor() { super('arena'); }
  preload() {
    this.load.image('menu-kaio', '/assets/portraits/el-felpo.png'); this.load.image('menu-luma', '/assets/portraits/gusta.png'); this.load.image('menu-joao', '/assets/portraits/joao-menu-v2.png');
    this.load.on('progress', (value: number) => { const status = document.getElementById('loading-status'); if (status) status.textContent = 'CARREGANDO ' + Math.round(value * 100) + '%'; });
    this.load.image('portrait-kaio', '/assets/portraits/el-felpo-bust.png'); this.load.image('portrait-luma', '/assets/portraits/gusta-bust.png'); this.load.image('portrait-joao', '/assets/portraits/joao-bust.png');
    for (const id of this.availableStages) this.load.image(id, `/assets/stages/${id}.png`);
    Object.entries(fighterAssets).forEach(([id, a]) => this.load.multiatlas(id, a.atlas, '/assets/fighters/'));
  }
  create() {
    // Match display density without changing arena coordinates.
    this.cameras.main.setOrigin(0, 0).setZoom(this.scale.width / C.width);
    this.cameras.main.setBackgroundColor('#10151e'); this.bg = this.add.graphics(); this.ink = this.add.graphics(); this.hud = this.add.graphics().setDepth(100);
    const text = (id: string, x: number, y: number, size: number, color = '#f5ecd8', align: 'left' | 'center' | 'right' = 'left') => { const t = this.add.text(x, y, '', { fontFamily: 'monospace', fontSize: `${size}px`, fontStyle: 'bold', color, align, stroke: '#11151c', strokeThickness: 3 }).setOrigin(align === 'center' ? .5 : align === 'right' ? 1 : 0, 0); t.setDepth(101); this.texts[id] = t; };
    text('left', 48, 21, 22); text('right', 912, 21, 22, '#f5ecd8', 'right'); text('timer', 480, 18, 39, '#f5ecd8', 'center'); text('round', 480, 65, 10, '#aab4bf', 'center');
    text('announce', 480, 190, 55, '#f6e9ce', 'center'); text('sub', 480, 254, 16, '#f6e9ce', 'center'); text('combo0', 57, 127, 23, '#f4b85d'); text('combo1', 903, 127, 23, '#74ddd1', 'right');
    text('meter0', 48, 511, 10); text('meter1', 912, 511, 10, '#f5ecd8', 'right'); text('debug', 20, 326, 11, '#c7e5e5');
    this.setRenderScale(this.scale.width / C.width);
    ['kaio', 'luma', 'joao', 'menu-kaio', 'menu-luma', 'menu-joao', 'portrait-kaio', 'portrait-luma', 'portrait-joao'].forEach(k => { if (this.textures.exists(k)) this.textures.get(k).setFilter(Phaser.Textures.FilterMode.NEAREST); });
    this.drawStage(); this.ready = true; this.onReady();
  }
  selectStage(index: number) { this.stage = index; if (this.bg) this.drawStage(); }
  setRenderScale(scale: number) { this.cameras.main.setOrigin(0, 0).setZoom(scale); Object.values(this.texts).forEach(t => t.setResolution(scale)); }
  drawStage() {
    const g = this.bg; g.clear(); this.children.getByName('stage-image')?.destroy(); this.children.getByName('old-sign')?.destroy(); const s = STAGES[this.stage];
    if (this.textures.exists(s.id)) {
      const image = this.add.image(480, 270, s.id).setName('stage-image').setDepth(-1); const src = image.texture.getSourceImage(); const scale = Math.max(960 / src.width, 540 / src.height); image.setScale(scale); image.y = C.floor + (src.height / 2 - stageFloor[s.id]) * scale; return;
    }
    g.fillStyle(s.sky); g.fillRect(0, 0, 960, 540);
    if (this.stage === 0) {
      const colors = [0x422236, 0x663345, 0x9b4a4b, 0xca6653, 0xe59065]; colors.forEach((c, i) => { g.fillStyle(c); g.fillRect(0, 75 + i * 55, 960, 57); });
      g.fillStyle(0xffcb83); g.fillCircle(680, 222, 69); g.fillStyle(0xe59065); for (let i = 0; i < 5; i++)g.fillRect(605, 235 + i * 13, 150, 5 + i);
      for (let layer = 0; layer < 2; layer++)for (let i = 0; i < 24; i++) { const h = 35 + ((i * 57 + layer * 31) % 119); g.fillStyle(layer ? 0x272635 : 0x4c3443); g.fillRect(i * 45 - 15, 360 - h + layer * 32, 38, h + 35); if (layer) { g.fillStyle(0xd08a68, .55); g.fillRect(i * 45 - 5, 370 - h, 5, 8); } }
      g.fillStyle(0x252a33); g.fillRect(0, 389, 960, 59); g.fillStyle(0x42434b); g.fillRect(0, 387, 960, 6);
      g.lineStyle(3, 0x1a202b); for (let i = 0; i < 12; i++) { g.lineBetween(i * 100, 320, i * 100, 406); g.lineBetween(i * 100, 335, i * 100 + 100, 373); g.lineBetween(i * 100, 373, i * 100 + 100, 335); } g.lineBetween(0, 320, 960, 320);
      g.fillStyle(0x23242d); g.fillRect(70, 297, 132, 76); g.fillStyle(0xe8b077); g.fillRect(80, 308, 111, 48);
      const sign = this.add.text(91, 319, 'FIGHT\n NERDS', { fontFamily: 'monospace', fontSize: 16, color: '#38313b', fontStyle: 'bold' }).setName('sign'); this.children.getAll().filter(o => o.name === 'old-sign').forEach(o => o.destroy()); sign.name = 'old-sign';
    } else if (this.stage === 1) {
      g.fillStyle(0xc2e6de); g.fillCircle(705, 140, 48); g.fillStyle(0x101c35); g.fillCircle(682, 125, 44);
      for (let i = 0; i < 90; i++) { g.fillStyle(0x9dc7cb, .4 + (i % 3) * .2); g.fillRect((i * 127) % 960, (i * 43) % 260, 2, 2); }
      [0, 1, 2].forEach(i => { g.fillStyle([0x1c3045, 0x213d4d, 0x294854][i]); g.fillTriangle(i * 380 - 220, 390, i * 380 + 180, 170 + i * 15, i * 380 + 580, 390); });
      g.fillStyle(0x15282f); g.fillRect(0, 380, 960, 70); for (const x of [150, 780]) { g.fillStyle(0x283d43); g.fillRect(x, 249, 25, 199); g.fillStyle(0x1a303a); g.fillTriangle(x - 60, 255, x + 12, 213, x + 85, 255); g.fillStyle(0x7ed8c1); g.fillRect(x + 4, 295, 16, 24); }
      g.fillStyle(0x425452); g.fillRect(265, 397, 430, 18); g.fillRect(230, 415, 500, 16); g.fillRect(200, 431, 560, 17);
    } else {
      for (let i = 0; i < 12; i++) { const x = i * 90, h = 150 + (i * 37) % 160; g.fillStyle(i % 2 ? 0x22293c : 0x1b2233); g.fillRect(x, 430 - h, 84, h); for (let j = 0; j < 5; j++) { g.fillStyle(j % 2 ? 0x657893 : 0xb07685, .45); g.fillRect(x + 15, 440 - h + j * 32, 11, 17); g.fillRect(x + 48, 440 - h + j * 32, 11, 17); } }
      g.fillStyle(0x1b1f2c); g.fillRect(0, 362, 960, 86); g.fillStyle(0xee6c98); g.fillRect(158, 224, 37, 146); g.fillStyle(0x81d4db); g.fillRect(724, 295, 133, 31); g.fillStyle(0x101722); g.fillRect(732, 303, 117, 15);
      g.lineStyle(3, 0x354052); for (const x of [80, 880]) { g.lineBetween(x, 240, x, 448); g.lineBetween(x, 240, x + 45, 240); g.fillStyle(0xf3d3ad); g.fillRect(x + 24, 239, 25, 6); }
    }
    g.fillStyle(this.stage === 2 ? 0x24283a : 0x34333c); g.fillRect(0, 448, 960, 92); g.fillStyle(0x747073); g.fillRect(0, 447, 960, 3);
    g.lineStyle(1, 0x646271, .35); for (let i = 0; i < 16; i++)g.lineBetween(480 + (i - 8) * 45, 448, 480 + (i - 8) * 110, 540); for (const y of [469, 508]) g.lineBetween(0, y, 960, y);
    if (this.stage === 0) { g.fillStyle(0xcfa36d, .3); g.fillRect(260, 494, 440, 3); }
  }
  consume(events: Event[]) { events.forEach(e => { if (this.sim && (e.type === 'parry' || e.type === 'tech')) { this.sim.fighters.forEach((f, i) => { if (e.type === 'tech' || Math.abs(f.x - e.x) < 10) this.animations[i].react(e.type === 'tech' ? 'throw_tech' : 'parry_success', this.clock); }); } if (e.type !== 'whiff') this.effects.push({ ...e, life: e.type === 'super' ? 24 : 15 }); if ((e.type === 'hit'||e.type==='finisher') && this.shake) this.shakeLife = e.type==='finisher'?9:5;if(this.blood&&(e.type==='hit'||e.type==='finisher'))this.effects.push({...e,type:'blood',value:e.type==='finisher'?10:5,life:24}); }); }
  update(_time: number, delta: number) { this.onTick(delta); this.renderDelta = this.visualPaused ? 0 : delta / 16.6667; this.clock += this.renderDelta; if (!this.ink) return; this.renderArena(); }
  renderArena() {
    const g = this.ink, h = this.hud; g.clear(); h.clear(); const sim = this.sim;
    if (!sim) { Object.values(this.texts).forEach(t => t.setVisible(false)); return; }
    if (this.attract) { Object.values(this.texts).forEach(t => t.setVisible(false)); this.sprites.forEach(s => s.setVisible(false)); this.portraitImages.forEach(p => p.setVisible(false)); return; }
    Object.values(this.texts).forEach(t => t.setVisible(true));
    if (this.previousSim !== sim || this.previousRound !== sim.round) { this.visualCamera.reset(); this.animations = [new FighterAnimation(), new FighterAnimation()]; this.previousSim = sim; this.previousRound = sim.round; }
    this.shakeLife = Math.max(0, this.shakeLife - this.renderDelta); const offset = this.shake && this.shakeLife > 0 ? Math.sin(this.clock * 3) * this.shakeLife * .5 : 0;
    const cam = this.visualCamera.update(sim.fighters[0].x, sim.fighters[1].x, this.renderDelta * 16.6667, this.visualPaused) + offset;
    const zoom = this.visualCamera.zoom; g.setScale(zoom).setPosition(0, C.floor * (1 - zoom));
    sim.fighters.forEach((f, i) => {
      g.fillStyle(0x080e16, .4); g.fillEllipse(f.x - cam, C.floor + 2, 90, 15);
      const asset = fighterAssets[f.id];
      if (asset && this.textures.exists(f.id)) {
        let sprite = this.sprites[i]; if (!sprite) sprite = this.sprites[i] = this.add.sprite(0, 0, f.id).setDepth(10);
        if (sprite.texture.key !== f.id) sprite.setTexture(f.id);
        const frame = this.animations[i].frame(f, this.clock); sprite.setFrame(frame);
        sprite.setVisible(true).setPosition((f.x - cam) * zoom, C.floor + (f.y - C.floor) * zoom).setOrigin(sprite.frame.pivotX, sprite.frame.pivotY).setScale(assetScale(f.id, frame) * zoom).setFlipX(f.facing < 0); if (i === 1 && sim.fighters[0].id === f.id) sprite.setTint(0xaddfff); else sprite.clearTint();
      } else { this.sprites[i]?.setVisible(false); drawFighter(g, f, f.x - cam, f.y, 1, this.clock); }
      if (sim.training?.boxes) {
        g.lineStyle(1, 0x64e2b4); const b = hurtbox(f); g.strokeRect(b.x - cam, b.y, b.w, b.h);
        g.lineStyle(1, 0xffd35d); g.strokeRect(f.x - cam - 34, f.y - 90, 68, 90);
        hitboxes(f).forEach(b => { g.fillStyle(0xff475d, .3); g.fillRect(b.x - cam, b.y, b.w, b.h); g.lineStyle(1, 0xff475d); g.strokeRect(b.x - cam, b.y, b.w, b.h); });
      }
    });
    if (this.attract) { Object.values(this.texts).forEach(t => t.setVisible(false)); this.portraitImages.forEach(p => p.setVisible(false)); return; }
    sim.projectiles.forEach(p => { g.fillStyle(FIGHTERS[sim.fighters[p.owner].id].color, .25); g.fillEllipse(p.x - cam - 10 * Math.sign(p.vx), p.y, 75, 32); g.fillStyle(0xfbe6ad); g.fillCircle(p.x - cam, p.y, 16); g.fillStyle(FIGHTERS[sim.fighters[p.owner].id].color); g.fillCircle(p.x - cam + 4, p.y, 11); });
    this.effects = this.effects.filter(e => e.life > 0); this.effects.forEach(e => {
      e.life -= .8 * this.renderDelta; const x = e.x - cam, y = e.y, n = (16 - e.life) * 2;
      if(e.type==='blood'){if(!this.blood)return;const age=Math.max(0,24-e.life);for(let i=0;i<(e.value??5);i++){g.fillStyle(i%2?0xc84142:0x8c2034,Math.max(0,e.life/24));g.fillCircle(x+(e.direction??1)*age*(1.3+i*.27),y-age*(1.7-i%3*.45)+age*age*.055,1.2+i%2*.6);}return;}
      const color = e.type === 'parry' ? 0x87f2ed : e.type === 'block' ? 0x99bde4 : e.type === 'super' ? 0xd0c4ff : 0xffd379;
      if (e.type === 'super' && !this.reduceFlash) { g.fillStyle(0xb091ff, .09); g.fillRect(0, 0, 960, 540); }
      g.lineStyle(3, color, Math.max(0, e.life / 15));
      if (e.type === 'land' || e.type === 'dash') { for (let i = 0; i < 5; i++) { g.fillStyle(0xd1bd9a, Math.max(0, e.life / 40)); g.fillEllipse(x + (i - 2) * (7 + n * .4), y - 3 - i % 2 * 4, 10 + n * .4, 4 + n * .1); } return; }
      if (e.type === 'block') { g.strokeEllipse(x, y, 12 + n * .5, 48 + n); return; }
      if (e.type === 'parry') { g.strokeRect(x - n / 2, y - n / 2, n, n); g.strokeCircle(x, y, 12 + n); }
      else g.strokeCircle(x, y, 12 + n);
      for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7; g.lineBetween(x + Math.cos(a) * n, y + Math.sin(a) * n, x + Math.cos(a) * (n + 12), y + Math.sin(a) * (n + 12)); }
    });
    if (this.stage === 2) { g.lineStyle(1, 0xaac2de, .22); for (let i = 0; i < 70; i++) { const x = (i * 71 + this.clock * 3) % 960, y = (i * 113 + this.clock * 13) % 540; g.lineBetween(x, y, x - 7, y + 18); } }
    h.fillStyle(0x0e131d, .85); h.fillRect(0, 0, 960, 105); h.fillStyle(0x0e131d, .7); h.fillRect(0, 490, 960, 50);
    sim.fighters.forEach((f, i) => {
      const color = FIGHTERS[f.id].color, x = i ? 530 : 48;
      h.fillStyle(0x4b3035); h.fillRect(x, 56, 382, 19); h.fillStyle(color); h.fillRect(i ? x + 382 * (1 - f.hp / C.life) : x, 56, 382 * f.hp / C.life, 15);
      h.lineStyle(1, 0xd5d3bf, .55); h.strokeRect(x, 56, 382, 19);
      for (let w = 0; w < 2; w++) { h.fillStyle(w < f.wins ? 0xf7d690 : 0x444951); h.fillCircle(i ? 900 - w * 20 : 60 + w * 20, 90, 5); }
      const mx = i ? 652 : 48; h.fillStyle(0x293440); h.fillRect(mx, 499, 260, 7); h.fillStyle(f.meter >= 100 ? 0xf8d485 : color); h.fillRect(mx, 499, 260 * f.meter / 100, 7);
      this.texts[`meter${i}`].setText(`SUPER ${Math.floor(f.meter).toString().padStart(3, '0')} / 100${f.meter >= 100 ? '  • PRONTO' : ''}`);
      this.texts[i ? 'right' : 'left'].setText(`${i ? '' : '01 / '}${FIGHTERS[f.id].name}${i ? ' / 02' : ''}`);
      const defender = sim.fighters[1 - i];if(defender.combo>1)this.comboReadouts[i]={text:`${defender.combo} HITS · ${defender.comboDamage}\n${defender.comboMoves.map(moveShort).join(' > ')}`,until:this.clock+55};this.texts[`combo${i}`].setFontSize(16).setText(this.clock<this.comboReadouts[i].until?this.comboReadouts[i].text:'');
      let portrait = this.portraitImages[i]; if (!portrait) portrait = this.portraitImages[i] = this.add.image(i ? 934 : 26, 38, 'portrait-' + f.id).setDepth(102); portrait.setTexture('portrait-' + f.id).setDisplaySize(34, 34).setVisible(true);
      // Portrait backing.
      h.fillStyle(color); h.fillRect(i ? 923 : 15, 24, 22, 24); h.fillStyle(FIGHTERS[f.id].skin); h.fillRect(i ? 927 : 19, 28, 14, 16); h.fillStyle(FIGHTERS[f.id].hair); h.fillRect(i ? 927 : 19, 27, 14, 6);
    });
    this.texts.timer.setText(sim.training ? '∞' : `${sim.seconds}`.padStart(2, '0')); this.texts.round.setText(`ROUND ${String(sim.round).padStart(2, '0')}`);
    let title = '', sub = '';
    if (sim.phase === 'intro') { title = sim.phaseFrame < 100 ? `ROUND ${sim.round}` : 'LUTE!'; sub = sim.draws >= 2 ? 'MORTE SÚBITA' : STAGES[this.stage].name; }
    if (sim.phase === 'outro') { title = sim.reason; sub = sim.winner === null ? 'EMPATE • ROUND SERÁ REPETIDO' : `${FIGHTERS[sim.fighters[sim.winner].id].name} VENCEU O ROUND`; }
    if(sim.canFinish){title='FINALIZE!';sub=this.finisherHint+' · GOLPE FINAL';}
    if(sim.phase==='finisher'){title=sim.phaseFrame<24?'GOLPE FINAL':'NOCAUTE!';sub=sim.phaseFrame<24?'':FIGHTERS[sim.fighters[sim.winner!].id].name;h.fillStyle(0x060b12,.75);h.fillRect(0,105,960,14);h.fillRect(0,476,960,14);}
    this.texts.announce.setText(title); this.texts.sub.setText(sub);
    const training = sim.training; this.texts.debug.setText(training ? sim.fighters.map((f, i) => `J${i + 1} ${f.state.toUpperCase()}  FRAME ${f.attackFrame}\n${f.history.slice(-9).map(h => `${h.dir}${h.pressed.filter(a => a.length === 2).join('+')}`).join(' → ')}\nCOMBO ${f.combo || f.lastCombo} / DANO ${f.comboDamage || f.lastDamage}`).join('\n\n') : '');
  }
}
