Desenvolva neste workspace um jogo completo e executável de luta 2D para navegador, inspirado na jogabilidade dos jogos de luta arcade dos anos 1990, especialmente Street Fighter III: 3rd Strike.

Implemente o projeto de verdade: crie arquivos, instale as dependências disponíveis, execute a aplicação, corrija erros e valide os principais fluxos. Não entregue apenas um plano, pseudocódigo ou trechos desconectados.

ESCOPO
Um jogo local com dois lutadores originais, três cenários selecionáveis, combate funcional, modo contra IA, versus local e treinamento. Não implemente multiplayer online nesta versão.

Use TypeScript, Vite e Phaser 3. Separe a simulação de combate da renderização para permitir testes da lógica. Não use serviços pagos nem exija chaves de API.

1. APRESENTAÇÃO E TELAS

Implemente:
- Menu principal.
- Seleção entre versus IA, versus local e treinamento.
- Seleção dos dois personagens e do cenário.
- Tela de instruções e configuração dos controles.
- Partida.
- Pausa.
- Resultado com revanche, nova seleção e retorno ao menu.

Interface em português brasileiro, com visual arcade coerente e boa legibilidade.

Durante a luta, mostrar:
- Nome e retrato dos personagens.
- Barras de vida.
- Barra de super.
- Indicador de rounds vencidos.
- Cronômetro.
- Contador de combo.
- Anúncios de round, luta, KO, tempo esgotado e vitória.

2. RESOLUÇÃO E SIMULAÇÃO

- Resolução lógica de 960 × 540.
- Escalonamento proporcional com barras nas áreas excedentes.
- Pixel art com nearest-neighbor.
- Simulação em passos fixos de 60 Hz, com acumulador e limite de atualizações por frame.
- Renderização independente da taxa de atualização.
- Medir startup, active, recovery, stun e janelas de comando em frames da simulação.
- Pausa e perda de foco devem limpar entradas mantidas.
- O cronômetro só avança durante o combate ativo.

3. PERSONAGENS

Crie dois lutadores originais:
- Lutador A: equilibrado, com projétil, antiaéreo e golpe de avanço.
- Lutador B: ágil, com caminhada mais rápida, ataques de menor alcance e especial de aproximação.

Os dois devem ter diferenças reais de alcance, velocidade e golpes. Dados de balanceamento devem ficar em arquivos próprios, sem números espalhados pela lógica.

4. MOVIMENTAÇÃO

Implementar:
- Parado.
- Caminhar para frente e para trás.
- Agachar.
- Pulo vertical, para frente e para trás.
- Gravidade e aterrissagem.
- Dash para frente e recuo com dois toques.
- Orientação automática para o adversário quando o estado permitir.
- Cruzamento de lados durante pulos.
- Limites da arena.
- Pushboxes para impedir sobreposição indevida no chão.
- Câmera horizontal limitada ao cenário, mantendo ambos os lutadores visíveis.

Estados mínimos:
idle, walk, crouch, jump, dash, attack, blockstun, hitstun, knockdown, wakeup, throw, thrown, victory e defeat.

Use uma máquina de estados explícita. Um personagem atingido ou derrubado não pode continuar andando nem iniciar ataques incompatíveis com seu estado.

5. CONTROLES DE TECLADO

Jogador 1:
- A/D: esquerda/direita.
- W: pular.
- S: agachar.
- F/G/H: soco fraco/médio/forte.
- V/B/N: chute fraco/médio/forte.

Jogador 2:
- Setas: movimentação.
- J/K/L: soco fraco/médio/forte.
- U/I/O: chute fraco/médio/forte.

Globais:
- Escape: pausa.
- Enter: confirmar.
- Atalho configurável para reiniciar o treinamento.

Evite rolagem da página durante o jogo. Permita remapeamento e salve preferências no localStorage. Avise sobre possíveis conflitos de teclas e limitações de ghosting do teclado.

6. CONTROLES POR GAMEPAD

Use a Gamepad API:
- Suporte para até dois controles.
- Direcional digital e analógico com deadzone configurável.
- Distribuição inicial dos seis ataques entre botões frontais e ombros.
- Start para pausa.
- Remapeamento.
- Indicador de conexão e desconexão.
- Pausar caso um controle usado na partida seja desconectado.
- Teclado e controle devem alimentar a mesma representação de entradas.

7. ATAQUES NORMAIS

Cada personagem deve possuir:
- Seis ataques em pé.
- Seis ataques agachado.
- Seis ataques aéreos.

Cada golpe deve definir:
- Startup, active e recovery.
- Dano.
- Hitstun e blockstun.
- Hitstop.
- Knockback.
- Altura: alto, médio ou baixo.
- Hitboxes por intervalo de frames.
- Hurtboxes pertinentes.
- Ganho de super.
- Cancelamentos permitidos.
- Efeito e animação associados.

Os ataques devem variar em alcance, velocidade ou utilidade. Não implemente seis botões com exatamente o mesmo golpe.

8. COLISÕES E RESOLUÇÃO DO COMBATE

Separe:
- Pushbox: espaço físico do lutador.
- Hurtbox: região vulnerável.
- Hitbox: região ofensiva.

Implemente:
- Colisão hitbox × hurtbox.
- Um acerto por alvo por instância de golpe, salvo golpes explicitamente multihit.
- Identificadores para evitar dano repetido em frames consecutivos.
- Resolução de contatos simultâneos, permitindo troca de golpes quando aplicável.
- Hitstop de duração definida sem bloquear o navegador.
- Hitstun, blockstun e knockback.
- Derrubada e recuperação.
- Invulnerabilidade apenas quando declarada nos dados do golpe.
- Ataques aéreos acertando como overhead.
- Ataques baixos exigindo defesa agachada.
- Defesa em pé bloqueando altos e médios.
- Defesa agachada bloqueando baixos e médios.
- Defesa segurando a direção contrária ao adversário.
- Sem defesa aérea nesta versão.
- Dano residual de especiais bloqueados, sem KO por dano residual nesta versão.
- Escalonamento progressivo de dano em combos, com mínimo configurável.
- Contador de combo reiniciado quando o defensor recuperar o controle.

9. COMANDOS E ESPECIAIS

Mantenha histórico de entradas por jogador, com direções relativas à orientação registrada em cada frame.

Reconheça:
- Quarto de círculo para frente + soco: projétil.
- Frente, baixo, diagonal para frente + soco: antiaéreo.
- Quarto de círculo para trás + chute: especial de avanço.
- Dois quartos de círculo para frente + soco: super.

Requisitos:
- Buffer configurável.
- Janela temporal e tolerância para transições.
- Prioridade do super sobre comandos mais simples.
- Não consumir a mesma entrada repetidamente.
- Diferenciar botão pressionado de botão mantido.
- Reconhecer comandos dos dois lados.
- Permitir atalhos opcionais de especiais apenas em treinamento e modo acessível.

Projéteis devem ter velocidade, dano, duração, limites, colisão e destruição. Defina uma regra consistente para choque entre projéteis.

10. AGARRÃO, PARRY E SUPER

Agarrão:
- Soco fraco + chute fraco.
- Alcance curto.
- Apenas contra alvo no chão e vulnerável.
- Falha com animação e recuperação.
- Escape ao apertar a mesma combinação dentro de uma janela configurável.
- Pequena proteção contra novo agarrão após recuperação.

Parry:
- Toque em direção ao adversário pouco antes do impacto.
- Toque para baixo para parry de ataques baixos.
- Janela e recuperação configuráveis.
- Evitar ativação contínua ao manter a direção.
- Sucesso anula dano e gera efeito visual e vantagem definida.
- Nesta versão, permitir parry somente no chão.
- Definir claramente quais ataques podem ser aparados; agarrões não podem.

Super:
- Medidor com limite explícito.
- Ganho por ações e contatos configuráveis.
- Consumo apenas ao iniciar um super válido.
- Super com sequência de impactos ou efeito claramente superior.
- Breve super freeze controlado pela simulação.
- Sem ativação durante estados proibidos.

11. ROUNDS E VITÓRIA

- Melhor de três rounds.
- Vida reiniciada a cada round.
- Cronômetro inicial de 99 segundos.
- KO quando a vida chegar a zero.
- No fim do tempo, vence quem tiver maior porcentagem de vida.
- Tratar double KO e empate no tempo.
- Em empate, nenhum ponto; repetir o round. Após dois empates consecutivos, aplicar morte súbita com vida reduzida para encerrar a disputa.
- Definir quando o medidor de super é preservado entre rounds.
- Impedir dano e movimentação durante introdução e encerramento.
- Transições consistentes, sem pontuar o mesmo round duas vezes.

12. INTELIGÊNCIA ARTIFICIAL

A IA deve usar as mesmas entradas e regras do jogador, sem alterar diretamente vida ou estados.

Implementar:
- Aproximação e recuo por distância.
- Ataques conforme alcance.
- Defesa.
- Antiaéreo ocasional.
- Projéteis.
- Uso de super.
- Erros e tempo de reação.

Três dificuldades, alterando reação, frequência de decisões e variedade. Não consultar entradas futuras do jogador nem reagir instantaneamente a todo ataque. Usar aleatoriedade com seed para permitir reprodução de testes.

13. TREINAMENTO

Adicionar:
- Vida e super infinitos configuráveis.
- Dummy parado, defendendo, pulando ou controlado pela IA.
- Reinício imediato de posições.
- Histórico de entradas.
- Exibição de estado e frame do ataque.
- Visualização de hitboxes, hurtboxes e pushboxes.
- Opção de velocidade reduzida e avanço de um frame quando pausado.
- Contador de dano e combo.

14. CENÁRIOS E ARQUIVOS DE ARTE

Procure imagens em public/assets/stages/.
Nomes esperados:
- sunset-road.png
- moon-temple.png
- rainy-street.png

Se existirem, use essas imagens como fundo, ajustando escala sem distorcer. Permita configurar a linha visual do piso para alinhar os pés dos lutadores.

Se faltarem, gere cenários provisórios com os recursos gráficos do Phaser. A ausência de imagens externas não pode impedir a execução.

Só implemente parallax independente se houver camadas separadas. Não simule camadas recortando arbitrariamente uma imagem única.

Para personagens:
- Suporte a spritesheets e atlas.
- Manifesto com animações, frames, duração, pivô e escala.
- Âncora consistente nos pés.
- Espelhamento horizontal.
- Separação entre animação visual e dados de colisão.

Se não houver sprites, desenhe lutadores provisórios articulados, com cabeça, tronco e membros, silhuetas diferentes e poses reconhecíveis para caminhada, pulo, socos, chutes, dano e queda. Não use apenas dois retângulos estáticos.

Use personagens e efeitos originais. Não dependa de extrair arquivos de ROMs.

15. EFEITOS E ÁUDIO

Implementar:
- Faíscas de impacto.
- Efeito de defesa e parry.
- Projéteis legíveis.
- Sombras no chão.
- Tremor de câmera moderado e configurável.
- Opção de reduzir flashes.
- Sons simples gerados por Web Audio quando não existirem arquivos.
- Volume e mute.
- Inicialização do áudio após interação do usuário.

16. ORGANIZAÇÃO

Use módulos com responsabilidades claras, por exemplo:
- scenes/
- combat/
- fighters/
- input/
- ai/
- rendering/
- audio/
- ui/
- data/
- tests/

Centralize configuração, dados dos golpes, balanceamento e manifestos de assets.

17. VALIDAÇÃO

Crie testes automatizados relevantes para:
- Comandos especiais nos dois lados.
- Prioridade de super.
- Um único dano por instância de golpe.
- Defesa alta e baixa.
- Janela de parry.
- Custo de super.
- Escape de agarrão.
- Fim de round e double KO.
- Consistência da simulação para a mesma sequência de entradas e seed.

Execute os testes, a checagem de TypeScript e o build. Se houver ambiente de navegador disponível, valide menu, seleção, luta, pausa e revanche. Informe precisamente o que foi ou não verificado.

18. ENTREGA

Entregue:
- Projeto executável.
- package.json com comandos de desenvolvimento, build e teste.
- README em português com instalação, execução, controles e regras.
- Guia para substituir cenários e sprites provisórios.
- Lista de limitações reais.

Prioridade de implementação:
1. Simulação e dois lutadores jogáveis.
2. Colisões, ataques e defesa.
3. Especiais, agarrão, parry e super.
4. Rounds e menus.
5. IA e gamepad.
6. Treinamento e acabamento.

Essa ordem é de execução; todos os itens fazem parte da entrega. Não encerre apenas no primeiro protótipo. Evite funções vazias, TODOs em funcionalidades essenciais e telas que aparentem funcionar sem implementar sua lógica.

Comece inspecionando o workspace e implemente o projeto.