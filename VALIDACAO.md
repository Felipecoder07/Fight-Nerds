# Validação — versão V3

Ambiente: Windows, Node 24, Chromium via Playwright. Projeto local, sem publicação.

## Correção de recuo e resposta aos comandos

- Removido o limite artificial de separação de 850 unidades. Cada jogador pode recuar até a parede real sem arrastar o adversário; a câmera ajusta o zoom para manter ambos visíveis, com margem nas bordas e HUD fixo.
- Inverter a direção permite interromper o dash após seus três primeiros frames.
- Comandos e ataques guardados não envelhecem durante hitstop. Ao terminar hitstun ou blockstun, a entrada volta a ser processada no mesmo frame.
- Hitstop dos normais reduzido de 4–8 para 2–4 frames; especiais usam 4 e os impactos do super, 3. A preparação do super e as reações legítimas ao dano continuam existindo.
- Pivôs horizontais calculados individualmente pela massa central do desenho; o Phaser espelha o pivô personalizado sem uma segunda inversão. Isso remove o salto lateral entre guarda e ataque. PNGs preservados; somente os metadados foram alterados.
- Regressões cobrem os dois jogadores, bordas reais, dash reverso, comandos durante hitstop, retorno imediato após stun e ataques sem deslocamento físico.

## Verificações

- 47 testes Vitest: combate, independência de posição, comandos, câmera, preferências inválidas, conflitos, sincronização das poses e regressões de movimento/resposta ao impacto.
- 10 fluxos Playwright: menu, seleção, tela cheia, galeria, luta local, pausa, treino, resultado/revanche, dois gamepads simulados, reconexão, remapeamento, sliders e selects por teclado/gamepad, carregamento dos quadros, viewport de 800 pixels e enquadramento da arena completa com pivôs espelhados.
- TypeScript estrito e build Vite de produção em `dist/`.
- Revisão visual do menu, seleção, HUD e golpes. Capturas em `docs/menu-v3.png`, `docs/selecao-v3.png` e `docs/luta-v3.png`.

## Implementado

- 22 ataques por personagem com oito poses: 18 normais e quatro especiais.
- Folhas de movimento e reação; entrada/saída do agachamento, fases do pulo e pouso, avanço/recuo, defesa alta/baixa, parry, dano, queda, recuperação, agarrão/erro/escape, vitória e derrota. Animações de ataque seguem startup, contato e recuperação da simulação; demais estados acompanham seus frames lógicos.
- Retratos de corpo inteiro no menu/resultado e bustos dedicados na seleção/HUD. Seleção animada e identificação do segundo jogador em partidas espelhadas.
- Dispositivo escolhido explicitamente por jogador; um gamepad não pode controlar ambos. Desconexão pausa, reconexão exige confirmação, botões mantidos precisam ser soltos. Índices esparsos de gamepad foram testados.
- Teclas e botões conflitantes são recusados; Escape cancela captura. Preferências antigas ou inválidas são saneadas.
- Menus, selects, sliders e galeria por teclado e pelos dois gamepads. Galeria permite pausar e avançar quadros.
- Câmera suave sem mover coordenadas de combate; tremor sem deslocar HUD. Pausa congela efeitos e chuva. Efeitos de defesa/parry/poeira e sons de erro, dash e pouso diferenciados.
- Atalhos diretos para os três modos, tela cheia e seleção ajustada para manter o botão de início acessível.
- Inicialização com progresso de carregamento; o menu só é liberado após a cena e as imagens carregarem. A verificação dos atlas encontrou essa corrida de inicialização, que foi corrigida no jogo.

## Limites da verificação

Gamepads foram emulados pela Gamepad API. Não houve conexão física de dois controles, avaliação auditiva humana ou teste de ghosting neste ambiente. Esses comportamentos dependem do teclado, driver e navegador usados pelo jogador.

A arte foi gerada e integrada, com oito poses por ataque; não representa animação manual revisada por um animador em cada pixel. A queda de Gusta usa a sequência própria de derrota, pois sua folha de reações veio com uma linha a menos. Detalhes e inventário em [ASSETS-V3.md](docs/ASSETS-V3.md).

O build pode emitir aviso de bundle acima de 500 kB devido ao Phaser; não impede a execução. O antigo bloqueio de dependências foi resolvido. Relatórios V2 descrevem somente a etapa anterior.
