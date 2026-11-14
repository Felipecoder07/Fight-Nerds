export const C = {
  hz: 60, width: 960, height: 540, arena: 1440, floor: 448, maxUpdates: 8,
  life: 1000, meter: 100, gravity: .72, jump: -13.4, push: 34,
  roundFrames: 99 * 60, intro: 150, outro: 150, wakeup: 20, knockdown: 44,
  commandWindow: 28, buffer: 7, transitionTolerance: 9, dashWindow: 13,
  parryWindow: 7, parryCooldown: 22, parryAdvantage: 18,
  throwRange: 78, throwTech: 10, throwProtection: 35, throwDamage: 110,
  comboMin: .3, comboScale: .12, superFreeze: 19,
  gainWhiff: 1, gainHit: 8, gainBlock: 4, gainHurt: 4,
};
export const STAGES = [
  { id: 'sunset-road', name: 'ROTA DO SOL', area: 'SÃO PAULO · 18:42', floor: 448, sky: 0x2b1527, accent: 0xff9a52 },
  { id: 'moon-temple', name: 'TEMPLO LUNAR', area: 'SERRA · 00:16', floor: 448, sky: 0x101c35, accent: 0x83d6d1 },
  { id: 'rainy-street', name: 'RUA ELÉTRICA', area: 'CENTRO · 23:08', floor: 448, sky: 0x151626, accent: 0xdca6ed },
];
export type FighterId = 'kaio' | 'luma' | 'joao';
export const FIGHTERS = {
  kaio: { name: 'EL FELPO', subtitle: 'O PULSO DA RUA', style: 'EQUILIBRADO', color: 0x9b5a3a, light: 0xe8c9a8, speed: 3.6, backSpeed: 2.7, reach: 1.15, damage: 1, dash: 8.5, skin: 0xc6865e, hair: 0x1b1920 },
  luma: { name: 'GUSTA', subtitle: 'VELOCIDADE EM ESTADO PURO', style: 'ÁGIL', color: 0x67a8e5, light: 0xd9ecff, speed: 4.6, backSpeed: 3.5, reach: .91, damage: .94, dash: 10.4, skin: 0xd0926e, hair: 0x1e1d26 },
  joao: { name: 'JOÃO', subtitle: 'PESO E PRECISÃO', style: 'FORÇA', color: 0x9b2232, light: 0xf0c9b8, speed: 3.3, backSpeed: 2.5, reach: 1.06, damage: 1.08, dash: 7.8, skin: 0xd5926b, hair: 0x1e1918 },
};
