# Fight Nerds — Circuito Underground

Jogo de luta 2D local em português, com TypeScript, Vite e Phaser 3. El Felpo tem mais alcance; Gusta tem deslocamento mais rápido. Inclui dois lutadores, três arenas, arte dedicada, oito poses por ataque e folhas de movimento e reação. Não precisa de serviços ou chaves de API.

## Executar

Use **Node.js 24 ou superior**. No PowerShell, use `npm.cmd` se a política de execução bloquear `npm.ps1`.

```powershell
npm.cmd install
npm.cmd run dev
```

Abra o endereço indicado pelo Vite, normalmente **http://127.0.0.1:5173**. O jogo precisa de um navegador de desktop com teclado ou gamepad. Clique em Entrar na luta para habilitar áudio.

```powershell
npm.cmd test          # Testes de simulação
npm.cmd run typecheck # TypeScript completo
npm.cmd run build     # TypeScript + produção em dist/
npm.cmd run preview   # Servir o build
npm.cmd run test:browser # Playwright: menu, seleção, luta, pausa, treino, resultado, revanche
```

Para os testes de navegador, instale o Chromium do Playwright se necessário: `npx.cmd playwright install chromium`. O teste de resultado usa a instância exportada pelo módulo de desenvolvimento para encerrar um round de forma determinística; as transições são acionadas pela interface.

**Estado atual:** 64 testes unit?rios. Arte de combate V4, encadeamentos, golpes direcionais, especiais exclusivos e finaliza??o opcional com sangue estilizado. Veja [ASSETS-V4.md](docs/ASSETS-V4.md) para arquivos, prompts e a pend?ncia das novas refer?ncias.

## Como jogar

Na seleção, escolha versus IA, versus local ou treinamento, dois lutadores (espelho permitido), uma arena e a dificuldade da IA. A partida é melhor de três rounds, cada um com 99 segundos de combate. O cronômetro para em introduções, encerramentos, hitstop e pausa.

| Ação | Jogador 1 | Jogador 2 |
|---|---|---|
| Esquerda / direita | A / D | ← / → |
| Pular / agachar | W / S | ↑ / ↓ |
| Socos fraco / médio / forte | F / G / H | J / K / L |
| Chutes fraco / médio / forte | V / B / N | U / I / O |
| Pausar / confirmar | Escape / Enter | Escape / Enter |
| Reiniciar treino / avançar frame pausado | R / ponto | R / ponto |

Dois toques na mesma direção executam dash ou recuo. Soltar ou inverter a direção interrompe o dash imediatamente. O recuo vai até a parede real da arena; a câmera afasta o enquadramento quando os lutadores se separam. Segure a direção contrária ao oponente para defender. Defesa em pé bloqueia altos e médios; agachada bloqueia baixos e médios. Golpes aéreos são altos (overhead). Não há defesa aérea.

As direções abaixo são **relativas ao oponente**. P significa qualquer soco; K, qualquer chute.

| Comando | Ação |
|---|---|
| ↓ ↘ → + P | Projétil |
| → ↓ ↘ + P | Antiaéreo |
| ↓ ↙ ← + K | Avanço |
| ↓ ↘ → ↓ ↘ → + P | Super, exige 100 de medidor |
| Soco fraco + chute fraco | Agarrão; a mesma combinação escapa nos primeiros 10 frames |
| Toque para frente | Parry de alto / médio nos próximos 7 frames |
| Toque para baixo | Parry de baixo nos próximos 7 frames |

O histórico armazena a direção relativa de cada transição. O super tem prioridade sobre comandos simples. Manter o botão não repete o ataque. Normais fracos e médios podem cancelar em especiais ao conectar; fortes cancelam em super. Especiais conectados também podem cancelar em super.

**Medidor:** máximo 100, ganho por início e contato; preservado entre rounds, reiniciado numa nova partida ou revanche. Super tem quatro impactos, redução progressiva de dano e freeze de 19 frames. Cada instância de golpe só atinge uma vez, exceto os quatro intervalos declarados do super. Projéteis opostos se destroem ao colidir. Especiais bloqueados causam dano residual, mas não matam.

KO ou maior porcentagem de vida no fim do tempo decide o round. Em double KO ou vida igual, nenhum jogador pontua: o round se repete. Após dois empates consecutivos, ambos começam com 150 de vida até um desempate. Não há dano nem movimentação durante introdução e encerramento.

**Gamepads:** selecione o dispositivo de cada jogador na seleção ou nas opções. Um controle não pode ser atribuído aos dois jogadores. Direcional ou eixo esquerdo; LP/MP/HP = 0/2/4, LK/MK/HK = 1/3/5; Start pausa. Desconectar um controle atribuído pausa a partida. Depois de reconectar, confirme os dispositivos e solte os botões antes de continuar. Nos menus, cima/baixo troca o foco, esquerda/direita ajusta selects/sliders, A confirma e B volta. Escape cancela remapeamento.

Em Controles & opções é possível remapear teclas, botões e reinício do treino, ajustar deadzone e volume, reduzir flashes e desligar tremor. Conflitos de teclas e botões são recusados; alguns teclados têm ghosting e podem exigir remapeamento ou gamepads. Preferências ficam no localStorage. No treino ou modo acessível, 1/2/3/4 geram os mesmos comandos de entrada para projétil/antiaéreo/avanço/super.

## Treinamento

Vida e super infinitos configuráveis; dummy parado, defendendo, pulando ou com IA; caixas de colisão; velocidade normal ou metade; reinício imediato. Estado, frame do golpe, histórico de entradas e dano/combo aparecem na arena. Pause e pressione ponto ou Avançar 1 frame para executar exatamente um passo, inclusive durante hitstop. Reiniciar mantém as opções e o medidor atual (o modo infinito o reabastece).

## Organização

- `src/combat/`: simulação determinística, estados, colisões e rounds, sem Phaser ou DOM.
- `src/data/`: configuração, 18 normais por personagem, especiais, manifestos e arenas.
- `src/input/`: reconhecimento de comandos e unificação teclado/gamepad.
- `src/ai/`: decisões por distância e dificuldade, com RNG da simulação e entradas convencionais.
- `src/scenes/` e `src/rendering/`: Phaser, cenário, HUD, lutadores articulados e efeitos.
- `src/audio/`: sintetizador Web Audio.
- `src/main.ts`: ciclo da aplicação, telas, seleção e treinamento.
- `tests/`: testes do combate e fluxos Playwright.

A simulação usa acumulador de 60 Hz com até oito passos por frame de renderização. Tudo que afeta combate usa frames inteiros. Animação decorativa e desenho usam o ciclo de renderização. Seed padrão: 1337. A IA não modifica estados nem vida e não lê entradas futuras.

## Arte e validação

Veja [o inventário e guia dos atlas V3](docs/ASSETS-V3.md). A galeria nas opções permite revisar cada ação, pausar e avançar quadros. Menu e seleção usam ilustrações e bustos dedicados; o segundo jogador recebe tonalidade distinta em partidas espelhadas.

Os efeitos sonoros são sintetizados; não há música. O escopo é jogo local de desktop: sem multiplayer online, controles de toque ou gravação de dummy. Balanceamento e acabamento artístico podem evoluir com partidas reais.

Os testes de gamepad usam dispositivos simulados. Conexão física, ghosting e avaliação auditiva precisam de verificação no equipamento do jogador. O jogo renderizado e o build foram validados; o antigo bloqueio de Phaser foi resolvido.
