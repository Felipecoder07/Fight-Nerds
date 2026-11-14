# Prompt para Gemini — imagens e animações de Fight Nerds

Use este prompt no gerador de imagens. Anexe a folha atual do personagem escolhido como referência. Gere uma animação por solicitação, mantendo a mesma referência entre solicitações. A integração no jogo está descrita no arquivo `prompt_gemini_correcoes.md`.

## Prompt principal para copiar

Crie assets originais de animação para meu jogo de luta 2D, Fight Nerds. Use a imagem anexada como referência obrigatória da identidade do personagem: rosto, cabelo, barba ou bigode, roupa, calçado, proporções e paleta. Preserve essa identidade em todos os quadros e em todas as solicitações seguintes.

PERSONAGEM DESTA SOLICITAÇÃO: [EL FELPO ou GUSTA]
ANIMAÇÃO DESTA SOLICITAÇÃO: [ID e descrição da tabela abaixo]
QUANTIDADE DE QUADROS: [quantidade da tabela]

IDENTIDADE DOS LUTADORES
- EL FELPO, ID técnico `kaio`: homem de cabelo escuro curto e barba cheia, camiseta marrom, bermuda escura e tênis claros, seguindo exatamente a referência anexada. Estilo equilibrado, golpes mais pesados e de maior alcance. Guarda firme, transferência de peso e movimentos com força perceptível.
- GUSTA, ID técnico `luma`: homem de cabelo escuro e bigode, camiseta azul-clara, calça azul-escura e tênis escuros, seguindo exatamente a referência anexada. Estilo ágil, guarda leve, golpes compactos e deslocamentos mais rápidos. Não transforme o personagem numa mulher por causa do antigo ID interno.

DIREÇÃO DE ARTE
- Pixel art de luta arcade do final dos anos 1990, com animação desenhada quadro a quadro, silhueta legível, volumes consistentes e contornos definidos.
- Criação original. Não copie personagens, roupas ou sprites de franquias existentes.
- Câmera lateral fixa, adequada a combate 2D; leve três quartos apenas no corpo, sem mudar o ângulo da câmera entre quadros.
- O personagem enfrenta a DIREITA em todos os quadros. A versão para a esquerda será obtida pelo jogo por espelhamento.
- Nada de aparência 3D, fotografia, borrão, interpolação artificial ou mudanças de estilo entre quadros.
- Preserve o tamanho da cabeça, comprimento dos membros, volume do corpo, roupa e calçado durante toda a sequência.

ESPECIFICAÇÃO DA FOLHA
- PNG com transparência alfa real. Não desenhe fundo preto, branco ou quadriculado para representar transparência.
- Células de 320 × 256 pixels, com exatamente 4 colunas. Use o número de linhas necessário para a quantidade solicitada; células excedentes ficam transparentes.
- A largura total deve ser 1280 pixels. Para 8 quadros, a altura é 512; para 12, 768; para 16, 1024. Sem espaços entre células e sem borda externa.
- Quadros em ordem de reprodução, da esquerda para a direita e de cima para baixo.
- Ponto de referência do personagem em cada célula: X = 128, Y = 240. É a origem do corpo no mundo, alinhada ao chão nas poses terrestres. Não desenhe esse ponto nem linhas de guia.
- Na guarda, o corpo ocupa aproximadamente 145–155 pixels de altura, coerente com as referências e com o enquadramento do jogo. Não aumente o tamanho do personagem durante o golpe.
- Mantenha margem para braços, pernas, cabelo e roupas; nenhum membro pode sair de sua célula ou tocar a pose vizinha.
- Não recentralize cada pose pela caixa visível do desenho. O ponto de referência precisa continuar igual mesmo quando o corpo se inclina ou um membro se estende.
- Em pulos e avanços, desenhe a mudança de POSE. O deslocamento do personagem pela arena será calculado pelo jogo; não faça o corpo atravessar as células para simular trajetória.
- Sem texto, números, nomes das ações, barras, interface, marca-d'água, molduras, adversário ou cenário.
- Não incorpore sombra do chão, projéteis, faíscas ou flashes ao desenho do lutador: esses efeitos serão assets separados.

QUALIDADE DA ANIMAÇÃO
- Mostre antecipação, aceleração, pose de contato legível e recuperação para a guarda.
- Cada quadro deve contribuir com uma mudança coerente; não entregue apenas cópias da mesma pose.
- Ataques fracos são compactos e rápidos; médios usam mais rotação; fortes têm antecipação e extensão maiores.
- Diferencie socos de chutes, golpes em pé de agachados e ataques aéreos de terrestres. Não reutilize a mesma sequência para todos os botões.
- Preserve o pé de apoio no chão durante golpes terrestres quando a ação exigir apoio. Evite tremor involuntário, pés deslizando e membros mudando de comprimento.
- Nas animações cíclicas, o último quadro deve conectar naturalmente ao primeiro, sem duplicá-lo desnecessariamente.
- Não acrescente quadros apenas para atingir a quantidade: desenhe transições úteis, com anatomia consistente.

ENTREGA DESTA SOLICITAÇÃO
Gere somente a folha da animação solicitada, como imagem utilizável. Não monte uma apresentação com vários personagens ou animações diferentes. Se não conseguir cumprir dimensões, transparência ou contagem exatas, informe a limitação em vez de afirmar que cumpriu. As imagens serão medidas e conferidas antes da integração.

Comece por `idle`, 8 quadros, do personagem escolhido. Nas solicitações seguintes, preserve rigorosamente a identidade e a escala dessa primeira folha aprovada.

## Catálogo de movimentos e imagens necessárias

Os dois lutadores têm as mesmas categorias de ações, com poses e características próprias. Hoje há 18 ataques normais e quatro especiais por personagem na simulação, mas a arte disponível é muito mais limitada. Os quadros abaixo são uma meta de produção visual; não alteram automaticamente os tempos de combate.

### Movimentação

| ID visual sugerido | Ação | Quadros sugeridos | Observação |
|---|---|---:|---|
| `idle` | Guarda e respiração | 8 | Loop suave |
| `walk_forward` | Caminhar para frente | 8 | Ciclo completo de passos |
| `walk_backward` | Caminhar para trás | 8 | Recuar mantendo a guarda; não apenas inverter o vídeo |
| `crouch_enter` | Abaixar | 4 | Transição da guarda para agachado |
| `crouch_idle` | Permanecer agachado | 4 | Loop discreto |
| `crouch_exit` | Levantar do agachamento | 4 | Voltar à guarda |
| `jump_start` | Impulso do pulo | 4 | Comprimir pernas e impulsionar |
| `jump_rise` | Subida | 4 | Pose no ar, sem deslocamento embutido |
| `jump_apex` | Ápice | 4 | Transição para descida |
| `jump_fall` | Descida | 4 | Preparação para aterrissar |
| `jump_land` | Aterrissagem | 4 | Absorver impacto e recuperar guarda |
| `dash_forward` | Dash para frente | 8 | Inclinação e recuperação claras |
| `dash_backward` | Recuo rápido | 8 | Defesa preservada, movimento distinto do avanço |

O jogo permite pulo vertical, para frente e para trás. As poses básicas de subida/ápice/descida podem ser compartilhadas se o resultado ficar natural; variações específicas são uma melhoria posterior. Não invente novos golpes durante esses pulos.

### Os 18 ataques normais de CADA personagem

LP/MP/HP = socos fraco/médio/forte. LK/MK/HK = chutes fraco/médio/forte. Cada ID abaixo deve ter sua própria sequência.

| Postura | Socos | Chutes | Quadros por golpe |
|---|---|---|---|
| Em pé | `stand_lp`, `stand_mp`, `stand_hp` | `stand_lk`, `stand_mk`, `stand_hk` | 8 fraco, 8 médio, 12 forte |
| Agachado | `crouch_lp`, `crouch_mp`, `crouch_hp` | `crouch_lk`, `crouch_mk`, `crouch_hk` | 8 fraco, 8 médio, 12 forte |
| No ar | `air_lp`, `air_mp`, `air_hp` | `air_lk`, `air_mk`, `air_hk` | 8 fraco, 8 médio, 12 forte |

Direção das poses:
- Em pé: jab curto, soco médio com rotação, soco forte com extensão; chute curto, chute médio lateral, chute forte com grande rotação.
- Agachado: três socos compactos com forças diferentes; três chutes baixos com extensões crescentes. `crouch_hk` é a rasteira que derruba.
- No ar: três socos e três chutes com silhuetas distintas, pernas e tronco coerentes com o pulo. Os ataques aéreos são overhead na lógica atual.
- Preserve o alcance relativo dos personagens: El Felpo mais longo e pesado; Gusta mais curto e ágil. O integrador ajustará a leitura visual às hitboxes existentes.

### Especiais

| ID | Ação | Quadros | Descrição |
|---|---|---:|---|
| `projectile` | Lançar projétil | 12 | Preparação, impulso dos braços, liberação e recuperação; projétil separado |
| `uppercut` | Antiaéreo | 12 | Impulso ascendente, braço em extensão e recuperação; trajetória feita pelo jogo |
| `advance` | Golpe de avanço | 12 | Golpe ofensivo com deslocamento; mais veloz para Gusta |
| `super` | Super de quatro impactos | 16 | Preparação forte, quatro poses de contato distintas e recuperação; efeitos separados |

Comandos: ↓↘→ + soco; →↓↘ + soco; ↓↙← + chute; ↓↘→↓↘→ + soco para super. A folha do super precisa permitir sincronizar os quatro contatos, sem transformar as poses em quatro deslocamentos embutidos.

### Defesa, dano, agarrão e resultado

| ID visual sugerido | Ação | Quadros |
|---|---|---:|
| `block_stand` | Defender em pé | 4 |
| `block_crouch` | Defender agachado | 4 |
| `parry_high` | Preparar parry alto/médio | 4 |
| `parry_low` | Preparar parry baixo | 4 |
| `parry_success` | Reação ao parry bem-sucedido | 4 |
| `hit_high` | Receber dano no tronco/cabeça | 4 |
| `hit_low` | Receber dano baixo | 4 |
| `hit_air` | Receber dano no ar | 4 |
| `knockdown` | Ser derrubado | 8 |
| `grounded` | Permanecer caído | 4 |
| `wakeup` | Levantar da queda | 8 |
| `throw_start` | Tentar agarrar | 4 |
| `throw_success` | Executar agarrão | 8 |
| `throw_whiff` | Errar agarrão e recuperar | 4 |
| `thrown` | Ser agarrado e lançado | 8 |
| `throw_tech` | Escapar do agarrão | 4 |
| `victory` | Comemorar vitória | 12 |
| `defeat` | Derrota definitiva | 8 |

Alguns IDs são subdivisões VISUAIS propostas dos estados existentes. A integração deve acioná-los a partir dos eventos e condições reais. Não representam novas mecânicas nem devem alterar janelas de parry, defesa ou agarrão.

## Prompt separado para retratos e menu

Anexe a referência atual do personagem e envie:

> Crie uma ilustração original de [EL FELPO / GUSTA] para o menu e a seleção do jogo de luta Fight Nerds. Preserve exatamente rosto, cabelo, barba/bigode, roupa, cores e identidade da referência. Pixel art detalhada e nítida, com a mesma linguagem dos sprites de combate. Personagem em guarda, expressão confiante, silhueta clara e iluminação coerente. Gere uma imagem de corpo inteiro, PNG de 768 × 1024 com transparência alfa real, sem cenário, chão, sombra, interface, letras ou marca-d'água. Não corte cabeça, mãos ou pés. Mantenha margens transparentes. Esta é uma ilustração de menu, não uma folha de animação. Entregue somente um personagem.

Depois, usando essa imagem aprovada como referência:

> Gere um retrato de busto de [PERSONAGEM], em PNG 512 × 512 com transparência real, rosto grande e legível para cartão de seleção e HUD. Preserve a identidade, roupa e paleta da imagem anexada. Não acrescente texto, molduras ou cenário. Não gere uma folha com várias opções.

Salvar, depois de verificar os arquivos:

```text
public/assets/portraits/el-felpo-menu.png
public/assets/portraits/el-felpo-portrait.png
public/assets/portraits/gusta-menu.png
public/assets/portraits/gusta-portrait.png
public/assets/fighters/el-felpo/<id-da-animacao>.png
public/assets/fighters/gusta/<id-da-animacao>.png
```

O loader atual usa uma única folha por lutador. Esses caminhos são o contrato PROPOSTO para a próxima integração: será preciso adaptar o manifesto e o carregamento ou empacotar as folhas num atlas. Não substitua a folha atual por uma imagem de dimensões diferentes sem atualizar o código.

## Efeitos separados, depois dos personagens

Gerar em lotes independentes: projétil de El Felpo, projétil de Gusta, explosão do projétil, faísca de soco, arco de chute, faísca de defesa, parry, brilho de super, poeira de dash e aterrissagem. Mesmo estilo e transparência real; sem personagens ou fundo. De 4 a 8 quadros por efeito, dimensões e organização explicitamente acordadas com o integrador. Sombras continuam sendo desenhadas pelo jogo.

## Conferência antes de integrar

Uma imagem bonita não garante uma spritesheet válida. Conferir dimensões reais, alfa, contagem e ordem dos quadros, alinhamento, margens, identidade, tamanho aparente e ausência de cortes. Rejeitar quadros duplicados, poses fora da célula e mudanças de roupa. Gerar um preview animado de cada sequência. A fluidez final também depende de tempos, transições e sincronização no código.
