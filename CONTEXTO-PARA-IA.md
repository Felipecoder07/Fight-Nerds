# Contexto para continuar o Fight Nerds

Leia este arquivo antes de retomar o trabalho. O projeto está em `C:\Users\Mateus\Downloads\Fight Nerds` e é um jogo de luta local feito com TypeScript, Vite e Phaser 3. O idioma da interface e do usuário é português. O objetivo desta anotação é preservar o contexto das alterações recentes e das decisões importantes.

## Estado mais recente

As correções pedidas para recuo, travadas e deslocamento visual ao atacar foram implementadas. No último ciclo, passaram 47 testes de lógica e 10 testes de navegador; o build de produção também passou. A pessoa usuária deve recarregar o jogo com Ctrl+F5 se estiver com uma versão antiga aberta.

## Correções recentes de movimento e resposta

- Removido o limite artificial de separação entre lutadores, que funcionava como uma parede invisível e podia impedir o recuo. O limite físico continua sendo a arena (`C.push` e `C.arena`).
- A câmera agora reduz o zoom quando os lutadores se afastam, mantendo-os enquadrados sem mudar suas posições no combate. Os elementos do HUD permanecem em coordenadas fixas. Veja `src/rendering/camera.ts` e `src/scenes/ArenaScene.ts`.
- É possível cancelar um dash invertendo a direção depois dos três primeiros frames.
- Hitstop ainda pausa brevemente a ação, mas foi reduzido nos golpes normais para 2–4 frames, nos especiais para 4 e nos impactos do super para 3. A pausa de preparação do super permanece mais longa por escolha de apresentação.
- A idade do buffer e o histórico de comandos são congelados durante hitstop. Isso evita perder toques rápidos durante a pausa de impacto.
- Quando hitstun ou blockstun termina, o jogo volta a processar a entrada no mesmo frame. O jogador ainda fica impossibilitado de agir durante a duração intencional da reação.
- Pivôs horizontais são calculados para cada quadro a partir do centro da massa visível, reduzindo o deslizamento lateral causado por margens diferentes nas imagens. O Phaser já espelha pivôs personalizados; não inverter novamente com `1 - pivotX` ao virar o lutador.
- Testes de regressão estão em `tests/movement-regressions.test.ts`; um teste de arena e pivôs espelhados está em `tests/browser/controls.spec.ts`.

## Estado do jogo e arte

- IDs internos: `kaio` é El Felpo; `luma` é Gusta.
- As imagens originais e os arquivos V2 foram preservados. Novos atlas V3 ficam em `public/assets/fighters/` e incluem folhas separadas para ataques, movimento e reações, mais seus JSONs multiatlas.
- Cada personagem tem 22 ataques com oito poses cada: 18 normais e quatro especiais. As poses de contato acompanham startup, frames ativos e recuperação da simulação.
- Foram integradas animações de guarda, caminhada, recuo, agachamento, salto, dash, bloqueio, parry, dano, queda, recuperação, agarrão e vitória/derrota. O atlas de reações de Gusta veio com uma linha a menos; sua queda usa a sequência própria de derrota na folha de movimento.
- Retratos dedicados de corpo inteiro aparecem no menu/resultado; bustos aparecem na seleção e no HUD. A seleção tem prévias animadas; a galeria permite pausar e avançar quadro a quadro.
- Ao repetir o mesmo personagem, o segundo jogador recebe uma tonalidade distinta.
- `docs/ASSETS-V3.md` documenta folhas, dimensões, organização, pivôs, escalas e o procedimento para reconstruir os metadados. `.tools/align-atlas.cjs` lê os pixels e ajusta somente os pivôs no JSON; não altera imagens.

## Outras implementações desta sequência

- Menu com acesso direto a versus IA, versus local e treinamento, além de opção de tela cheia.
- Dispositivo escolhido explicitamente por jogador. Um gamepad não pode pertencer aos dois jogadores. Desconexão pausa a partida e retomar exige confirmar o dispositivo. Entradas mantidas precisam ser soltas; controles conectados em índices esparsos são tratados.
- Teclas e botões duplicados são recusados; Escape cancela a captura. Preferências armazenadas são validadas e valores inválidos usam padrões seguros.
- Navegação por teclado e por qualquer um dos dois gamepads em menus, selects, sliders e galeria.
- Efeitos de impacto, defesa, parry, pouso e dash. Efeitos e tremor param durante pausa; o HUD não treme com a câmera. Áudio sintetizado inclui sons de erro, dash e pouso, sem trilha musical.
- Inicialização mostra progresso e só libera o menu depois que a cena carrega.

## Verificações e limites

- `npm.cmd test`: 47 testes Vitest aprovados.
- `npm.cmd run test:browser`: 10 testes Playwright aprovados; gamepads foram simulados pela Gamepad API.
- `npm.cmd run build`: build Vite/TypeScript aprovado. Vite pode avisar que o bundle do Phaser passa de 500 kB; o build termina normalmente.
- Capturas recentes em `docs/menu-v3.png`, `docs/selecao-v3.png`, `docs/luta-v3.png`, `docs/apoio-neutro.png`, `docs/apoio-ataque.png` e `docs/arena-recuo.png`.
- Controles físicos, ghosting, avaliação auditiva e o acabamento artístico quadro a quadro não foram verificados em hardware/sessões humanas.
- `README.md` e `VALIDACAO.md` foram atualizados. Relatórios V2 e prompts antigos mantêm contexto histórico; leia o inventário V3 para o estado atual dos atlas.

## Comandos úteis no Windows

No PowerShell, se `npm` for bloqueado pela política de execução, use `npm.cmd`:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:browser
npm.cmd run dev
```

Antes de alterar movimento ou pivôs, preserve os testes de regressão e verifique os dois jogadores, as duas orientações e o enquadramento nos extremos da arena.
