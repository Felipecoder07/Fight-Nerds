# Arte V3

Arte gerada com image_gen a partir das referências existentes de El Felpo (ID `kaio`) e Gusta (ID `luma`). Os arquivos originais e V2 foram preservados. Nenhuma chave de API é necessária para executar o jogo.

| Folha | Dimensões reais | Organização | Poses |
|---|---|---|---|
| kaio-attacks-v3.png | 1093 × 1438 | 8 colunas × 22 linhas | 176 |
| luma-attacks-v3.png | 1024 × 1536 | 8 × 22 | 176 |
| kaio-motion-v3.png | 1265 × 1243 | 8 × 12 | 96 |
| luma-motion-v3.png | 1024 × 1536 | 8 × 12 | 96 |
| kaio-reactions-v3.png | 1024 × 1536 | 8 × 14 | 112 |
| luma-reactions-v3.png | 1312 × 1199 | 8 × 13 | 104 |

Total: 384 poses de El Felpo e 376 de Gusta. As duas imagens `el-felpo-bust.png` e `gusta-bust.png`, em `public/assets/portraits/`, são bustos novos para seleção e HUD. Menu e resultado mantêm as ilustrações de corpo inteiro.

## Ordem e integração

Ataques: LP/MP/HP/LK/MK/HK em pé, agachado e no ar; projétil, antiaéreo, avanço e super. Cada linha contém oito poses de preparação, extensão, contato e recuperação. O quadro de contato acompanha o intervalo ativo do golpe, sem modificar hitboxes ou tempos de combate.

Movimento: guarda, andar para frente, andar para trás, agachar, guarda agachada, levantar, ciclo do salto, dash, recuo, vitória, derrota e levantar do chão. As fases do salto e o pouso usam as poses correspondentes do ciclo.

Reações de El Felpo: defesa alta/baixa, parry alto/baixo, sucesso de parry, dano alto/baixo/aéreo, queda, recuperação, agarrão conectado, agarrão no vazio, escape e ser agarrado. A folha de Gusta omitiu a linha de queda; seu atlas mantém os nomes das outras linhas e a queda usa a sequência de derrota da folha de movimento. Não é substituída por um ataque.

`src/data/assets.ts` associa ações a quadros. Os JSONs `kaio-v3.json` e `luma-v3.json` são multiatlas do Phaser. `.tools/build-atlas.cjs` lê alfa e grava somente metadados de recorte, pivô e escala; não altera pixels. Execute com o servidor Vite ativo em 5173. Alguns limites de linha são definidos explicitamente porque as folhas não têm linhas de altura uniforme. Não divida a altura total pelo número de linhas.

Escalas em `src/data/assetScales.json` normalizam a guarda a aproximadamente 128 pixels de altura. Pivôs usam o último pixel opaco de cada célula. Os arquivos são PNG com alfa; cores de fundo em alguns previews da ferramenta não fazem parte do fundo exibido no jogo.

Correção de alinhamento: depois de reconstruir os atlas, execute `node .tools/align-atlas.cjs` com o Vite ativo. Esse script lê o alfa e ajusta somente o pivô horizontal de cada quadro à mediana dos pixels da região central do corpo (40–65% da altura visível). Usar o centro da célula fazia o personagem deslizar entre poses, pois as margens variam entre colunas e folhas. O pivô vertical continua alinhado ao piso. Phaser já espelha os pivôs personalizados: não use `1 - pivotX` para o jogador voltado à esquerda.

## Reprodução dos pedidos de arte

- Ataques: usar o lutador de referência, identidade/roupa/direção constantes, grade de oito colunas e 22 linhas na ordem acima, oito desenhos por ação, fundo transparente, sem texto ou efeitos embutidos, com margem para extremidades.
- Movimento: mesma identidade e oito colunas, 12 linhas de ações na ordem acima, fases contínuas, pés e escala consistentes.
- Reações: mesma identidade e oito colunas, 14 linhas na ordem acima, poses legíveis de defesa, dano e agarrão.
- Bustos: cabeça, ombros e peito em pixel art arcade, rosto grande e reconhecível, mesma barba/bigode/roupa, fundo transparente, sem corpo inteiro ou texto.

Use Controles & opções → Galeria de animações para inspecionar cada sequência, pausar e avançar quadros. Oito desenhos não garantem por si só acabamento artístico de produção; as capturas registram a integração real.
