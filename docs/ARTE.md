# Substituir arte

## Cenários

Coloque PNGs nestes caminhos (sem alterar os nomes):

```text
public/assets/stages/sunset-road.png
public/assets/stages/moon-temple.png
public/assets/stages/rainy-street.png
```

Os arquivos são detectados antes da inicialização. Quando ausentes, a arena correspondente é desenhada pelo Phaser. Use, de preferência, imagens de 960 × 540. O fundo preserva proporção, cobrindo a área da luta com possível corte nas bordas; não é esticado. Sem camadas separadas, não há parallax artificial.

Em `src/data/assets.ts`, `stageFloor` define a coordenada Y do piso **em pixels da imagem original**. O renderizador alinha essa linha ao piso lógico Y = 448. Por exemplo, num PNG de 1920 × 1080 com piso em Y = 896, configure 896. Mantenha céu e piso suficientes para cobrir a tela depois do alinhamento. O tamanho da arena simulada é 1440; a câmera mantém os dois lutadores visíveis e é limitada ao cenário. O fundo provisório ocupa a tela, sem rolagem independente.

## Spritesheets e atlas

Coloque os arquivos em `public/assets/fighters/` e adicione uma entrada em `fighterAssets`, em `src/data/assets.ts`. Exemplo de spritesheet:

```ts
export const fighterAssets: Partial<Record<FighterId, FighterAsset>> = {
  kaio: {
    image: '/assets/fighters/kaio.png',
    frameWidth: 128,
    frameHeight: 160,
    pivot: { x: 0.5, y: 1 },
    scale: 1,
    animations: {
      idle: { frames: [0, 1, 2, 3], duration: 8, loop: true },
      walk: { frames: [4, 5, 6, 7], duration: 5, loop: true },
      crouch: { frames: [8], duration: 1, loop: false },
      jump: { frames: [9, 10], duration: 10, loop: false },
      punch: { frames: [11, 12, 13], duration: 4, loop: false },
      kick: { frames: [14, 15, 16], duration: 5, loop: false },
      uppercut: { frames: [17, 18, 19], duration: 6, loop: false },
      hitstun: { frames: [20, 21], duration: 5, loop: false },
      knockdown: { frames: [22, 23], duration: 8, loop: false },
      victory: { frames: [24, 25], duration: 12, loop: true },
    },
  },
};
```

`duration` é o número de frames de simulação por frame visual. Adicione também `dash`, `blockstun`, `wakeup`, `throw`, `thrown` e `defeat`; animações ausentes usam `idle`. Os golpes usam a chave `animation` dos dados dos golpes. Para um atlas, forneça `atlas: '/assets/fighters/kaio.json'`, `image` com o PNG do atlas e nomes de frames (strings) nas animações. O atlas deve ser compatível com o loader de atlas JSON do Phaser.

O pivô é normalizado: `(0.5, 1)` fica no centro dos pés. Desenhe todos os frames com os pés no mesmo ponto, sem trim inconsistente. A escala é uniforme e o renderizador espelha automaticamente para o adversário. As colisões não vêm da textura: ajuste `hurtbox`, intervalos de `boxes` e propriedades dos golpes em `src/data/moves.ts`. Coordenadas são relativas aos pés, com X positivo para a frente e Y negativo para cima. Teste o alinhamento no treinamento, com caixas ativadas.

Para modificar os lutadores provisórios, edite `src/rendering/fighter.ts`. Cores, alcance, velocidade e dano base ficam em `src/data/config.ts`. Não use arquivos extraídos de ROMs; use arte original ou com licença adequada.
