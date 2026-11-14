# Prompt para Gemini — corrigir e finalizar Fight Nerds

Continue o projeto existente neste workspace. Leia `prompt_codex.md`, `README.md`, `VALIDACAO.md`, os arquivos em `src/` e `prompt_gemini_animacoes.md`. Implemente as correções e valide o jogo de verdade. Preserve o trabalho existente e os assets; não recrie o projeto do zero. O arquivo `prompt_gemini.md` anterior é sobre cenários, não substitui estas instruções.

Os nomes atuais são **EL FELPO** (ID interno `kaio`) e **GUSTA** (ID interno `luma`). Preserve as referências visuais atuais em `public/assets/fighters/kaio.png` e `luma.png`, respectivamente. Não volte a nomes, roupas ou identidades antigas.

## 1. Diagnóstico e controle independente no 1×1 — prioridade máxima

Relato do jogador: ao movimentar um personagem no versus local, o adversário também é afetado. Reproduza antes de corrigir. Distinga quatro situações:

1. A mesma entrada aciona os dois jogadores: erro de roteamento ou remapeamento.
2. Um personagem empurra o outro ao encostar no chão: pode ser a pushbox funcionando corretamente.
3. Ambos mudam de posição na tela enquanto a câmera acompanha: o adversário pode estar parado no mundo.
4. Um lutador distante muda sua posição no mundo sem entrada, contato ou golpe: deslocamento indevido.

Ponto concreto encontrado no código: `Simulation.pushboxes()`, em `src/combat/simulation.ts`, contém uma regra de distância máxima de 850 que modifica as posições X DOS DOIS lutadores. Isso pode arrastar o adversário ao se afastar. Corrija esse comportamento. Preserve o objetivo de manter os dois visíveis usando uma política explícita de limites de deslocamento e câmera; quando um limite compartilhado impedir maior separação, limite quem tenta se afastar, sem teleportar ou puxar o jogador parado. Resolva entradas simultâneas de forma determinística e sem favorecer a ordem J1/J2.

Não remova a pushbox de contato. Ela deve impedir sobreposição no chão, permitir cruzamentos aéreos adequados e respeitar paredes. Diferencie empurrão por contato de correção artificial a longa distância.

Revise `src/input/manager.ts` e a escolha do modo em `src/main.ts`:
- Cada jogador recebe um objeto de entrada próprio, com histórico, buffer e detecção de botão pressionado independentes.
- No modo local, nenhuma IA ou comando do jogador 1 deve alimentar o jogador 2.
- Teste controles padrão e preferências previamente salvas no localStorage.
- Valide o esquema das preferências ao carregar; trate JSON válido com estrutura inválida, ações faltando e versões antigas.
- Ofereça Restaurar controles padrão. Mostre conflitos entre jogadores e teclas reservadas; não permita atribuições conflitantes silenciosamente.
- Mantenha a atribuição de gamepads estável durante a partida. Hoje a lista de controles conectados é filtrada e indexada de novo; uma desconexão pode mudar quem controla cada lutador. Não transfira o controle restante automaticamente para o adversário.
- Pause ao desconectar um dispositivo usado; exija confirmação de reatribuição quando necessário. Limpe teclas presas e exija soltar botões mantidos antes de retomar.
- Permita teclado + teclado, teclado + gamepad e gamepad + gamepad, com indicação clara da fonte de cada jogador.
- No treino, deixe explícito se J2 está sob controle do dummy ou do humano.

Crie testes que verifiquem as coordenadas NO MUNDO, não apenas na tela: mover J1 distante não altera X de J2; o inverso também; separação máxima não arrasta o parado; aproximação com contato gera somente empurrão esperado; câmera não muda o estado da simulação; dois inputs diferentes continuam independentes; gamepad desconectado não troca de dono. Teste combinações simultâneas, lados invertidos e paredes.

## 2. Personagens visíveis e identidade consistente no menu

Relato do jogador: as imagens dos personagens não aparecem no menu.

O código atual usa `portrait()` em `src/main.ts` para desenhar SVGs simplificados nos cartões, em vez de usar os retratos reais. A apresentação do menu também depende dos sprites da cena de fundo, sujeitos ao enquadramento e à camada de overlay. Não presuma que o problema é apenas um caminho incorreto.

- Integre imagens reais de corpo inteiro no menu e retratos reais na seleção, HUD e resultado, usando um manifesto com caminhos explícitos.
- Garanta El Felpo e Gusta claramente visíveis, grandes e coerentes com o que aparece na luta. Não deixe degradês ou textos cobrirem seus rostos e corpos.
- Corrija o preview animado: a simulação de apresentação não avança atualmente, então animações baseadas em `stateFrame` podem ficar no primeiro quadro. Use um relógio visual de apresentação, sem ativar combate no menu.
- Valide carregamento, proporção e transparência; mostre fallback reconhecível e aviso de asset ausente em desenvolvimento se uma imagem falhar.
- Nunca recorte um retrato através de coordenadas arbitrárias de uma folha se houver retrato dedicado disponível.
- No duelo espelhado, diferencie J1 e J2 com identificação clara e, se houver arte compatível, paleta alternativa sem mudar a identidade.

## 3. Melhorar menu, seleção e navegação

Reorganize a interface em português brasileiro, com visual arcade consistente e legível:
- Menu com ações diretas: Versus IA, Versus local, Treinamento, Controles e opções, Tela cheia.
- Arte dos dois personagens em destaque, hierarquia clara, botões grandes e foco visível.
- Seleção com retratos reais, nomes atuais, estilo de luta, identificação J1/J2, prévia do lutador e prévias reais dos três cenários.
- Dificuldade aparece apenas quando houver IA relevante. Não apresente um controle sem efeito no versus local.
- Navegação por mouse, teclado e gamepad: foco, confirmar, voltar e cancelamento de remapeamento.
- Controle o estado de navegação de verdade. Enter/Escape/Start numa tela de opções não pode confirmar uma seleção escondida, retomar uma partida indevidamente ou disparar duas ações.
- Separe os eventos de interface das entradas de combate. Abrir menu ou capturar remapeamento não deve executar golpes.
- Ajuste textos pequenos baseados somente em `cqw`, sobretudo controles e treino; mantenha legibilidade em telas menores e em 720p/1080p.
- Preserve as configurações ao sair e voltar, sem restaurar silenciosamente escolhas ou controles.
- Assets e fontes devem funcionar localmente após instalação, sem depender de chamadas externas em tempo de jogo.

## 4. Tela cheia funcional

- Adicione botão Entrar em tela cheia no menu e acesso durante pausa; depois de entrar, ofereça Sair da tela cheia.
- Use a API de tela cheia a partir da interação do usuário e trate a rejeição da solicitação.
- O elemento ampliado deve conter canvas, HUD e overlays, mantendo menus e pausa utilizáveis.
- Preserve a proporção lógica 960 × 540, com barras quando necessário, sem deformação ou cortes e com pixel art nítida.
- Sincronize o tamanho do Phaser e o layout DOM após entrar/sair, redimensionar janela ou mudar orientação.
- Trate a saída pelo Escape e o evento de mudança de tela cheia. Não deixe estado visual errado nem conflito que pause e retome imediatamente.
- Se tela cheia não for suportada, ofereça um modo expandido no navegador e informe claramente a diferença. Não simule tela cheia apenas escondendo parte do site.

## 5. Animações completas e sincronizadas com a luta

As folhas atuais têm 16 quadros por personagem. O manifesto em `src/data/assets.ts` reutiliza os mesmos poucos quadros, e `src/data/moves.ts` associa muitos golpes apenas a `punch`, `kick` e `uppercut`. Isso não é suficiente para distinguir os 18 normais, especiais e todas as reações.

Use o catálogo completo de `prompt_gemini_animacoes.md`. Se novas imagens ainda não estiverem disponíveis, mantenha o fallback existente e declare a pendência. Não invente caminhos para arquivos inexistentes nem diga que integrou imagens que não recebeu.

Implemente:
- Manifesto por personagem, com folhas ou atlas, frame/pivô/escala, animações distintas e validação de índices.
- Mapeamento por ID de golpe: `stand_lp` ... `air_hk`, `projectile`, `uppercut`, `advance`, `super`, sem reduzir tudo ao mesmo soco/chute.
- Diferenciação visual de caminhada para frente/trás, dash/recuo, agachar/levantar, fases do pulo, defesa em pé/agachada, dano alto/baixo/aéreo, parry, agarrão acertado/errado/escapado, queda, levantar, vitória e derrota.
- Preserve uma máquina de estados de combate explícita. Subdivisões visuais não devem introduzir atrasos ou novas regras de combate sem necessidade.
- Sincronização de antecipação, contato e recuperação com startup/active/recovery dos dados. Um quadro de braço recolhido não pode representar a fase em que a hitbox está estendida.
- Durações por quadro ou mapeamento por fase; não dependa apenas de um `duration` uniforme que reproduz toda a animação antes do fim do golpe.
- Animação de golpe acompanha `attackFrame`; hitstop e pausa congelam a pose; câmera e interpolação não alteram hitboxes.
- Elimine tremor de pivô, mudança aparente de escala e pés deslizando. Use as coordenadas reais dos PNGs, não apenas as dimensões pedidas ao gerador.
- Preserve o impulso horizontal do pulo quando um ataque aéreo começar, se essa for a regra escolhida. Hoje `startMove()` zera `vx`; verifique se isso interrompe o pulo de forma abrupta. Defina e teste o comportamento.
- Adicione preview de animações em desenvolvimento para conferir cada ação, pivô, tempo, loop e hitbox.

Não aumente a quantidade de quadros da simulação para acomodar a arte. Mais quadros desenhados precisam ser distribuídos nos tempos existentes. Não altere dano, velocidade ou cancelamentos apenas para esconder um problema de animação.

## 6. Renderização, câmera, efeitos e som

- Estabeleça profundidades explícitas: cenário, sombras, lutadores, efeitos, caixas de depuração, HUD e menus. Hoje sprites criados depois dos textos podem acabar sobre o HUD; o uso de Graphics compartilhado também requer atenção à ordem.
- Câmera horizontal suave e limitada, com os dois lutadores visíveis, sem arrastar suas coordenadas. Se usar interpolação, aplique somente no desenho e ressincronize em reinício, troca de round e teleporte legítimo.
- Tremor do mundo não deve tornar barras e textos ilegíveis; mantenha HUD estável se possível.
- Corrija efeitos cuja duração depende da quantidade de renderizações: há efeitos com `life -= .8` por render. A duração deve ser estável em telas de 60/120/144 Hz e respeitar a política de pausa.
- Ajuste piso das imagens existentes, escala e posição dos pés, em cada arena. Evite faixas vazias após alinhar imagens externas.
- Não crie parallax recortando uma imagem plana. Use camadas separadas apenas quando existirem.
- Use projéteis e impactos visualmente distintos para cada lutador, sem comprometer a leitura de defesa e parry.
- Diferencie áudio de golpe no vazio, acerto, bloqueio, parry, agarrão e super. Respeite volume, mute e inicialização por interação. Não gere erro se o áudio estiver indisponível.
- Respeite reduzir flashes, desligar tremor e preferências de movimento reduzido.

## 7. Combate e treinamento: conferir antes da entrega

Revalide normais nas três posturas, saltos, cruzamentos, seis botões distintos, bloqueio alto/baixo, comandos dos dois lados, projéteis, antiaéreo, avanço, quatro contatos do super, cancelamentos, agarrão/escape, parry, knockdown e levantar.

- Teste contatos simultâneos e double KO sem vantagem causada pela ordem de atualização.
- Confira que ataques ignorados por invulnerabilidade não geram dano posterior indevido, super não ativa em estados proibidos e comando não é consumido duas vezes.
- Confira preservação de medidor, reset de vida, empates, morte súbita e pontuação única por round.
- Verifique se animações de intro, KO e vitória permanecem legíveis mesmo quando o combate está bloqueado.
- No treino, mostre entradas separadas de J1/J2, estado, frame e fase do golpe, combo e dano. Diferencie os frames de simulação da velocidade de reprodução: o modo de metade da velocidade mantém passos lógicos de 60 Hz, executados mais devagar; não o rotule como uma simulação diferente sem explicar.
- Teste avanço de um frame durante hitstop, opções infinitas ligadas/desligadas, reinício e todos os modos de dummy.
- Evite que o painel de treino esconda os personagens ou as caixas importantes.

## 8. Organização, validação e entrega

Separe a interface e suas telas de `src/main.ts` em módulos com responsabilidades claras, conforme a necessidade real. Centralize novos dados de assets, controles e tempos. Preserve simulação independente do Phaser. Não faça uma refatoração ampla que impeça corrigir e testar os problemas prioritários.

O relatório antigo registra um bloqueio de instalação de Phaser, mas o workspace já contém assets, `package-lock.json` e `dist/`. Inspecione o estado ATUAL: não repita o diagnóstico antigo sem executar os comandos novamente.

Execute:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:browser
npm.cmd run dev
```

Instale o navegador do Playwright se necessário e permitido. Valide no navegador os fluxos reais, não apenas a existência do canvas. Amplie os testes onde faltarem garantias para as correções: independência de entradas/posição, gamepad estável, retratos carregados, animações distintas, tela cheia, pausa, seleção, treino e revanche.

Critérios de aceite:
1. No 1×1, cada jogador controla somente seu personagem. O adversário parado não é arrastado ao se afastar; empurrão por contato e movimento de câmera continuam corretos.
2. El Felpo e Gusta aparecem no menu, seleção, HUD e resultado com a identidade atual.
3. Tela cheia entra e sai corretamente, sem deformar o jogo ou inutilizar menus.
4. Cada ação tem animação apropriada quando o asset correspondente está disponível; arte faltante é documentada com fallback funcional.
5. Os tempos de impacto correspondem às poses, sem tremor, cortes ou mudança de tamanho.
6. Todos os testes, TypeScript e build passam; fluxos no navegador são verificados ou marcados explicitamente como não verificados, com o impedimento real.

Entregue os arquivos alterados, o jogo executável, uma lista curta de correções e pendências reais, previews ou capturas úteis, e atualize README/VALIDACAO com os resultados atuais. Não entregue só recomendações ou um menu que aparenta funcionar. Se não tiver acesso à geração de imagens ou ao projeto, diga exatamente quais arquivos precisam ser fornecidos e não finja que os criou.
