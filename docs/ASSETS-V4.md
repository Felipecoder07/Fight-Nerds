# Arte e combate V4

As imagens foram geradas com a ferramenta integrada `image_gen`. Os prompts completos e as referências estão em [v4-generation-prompts.json](v4-generation-prompts.json).

## Arquivos usados

- `public/assets/fighters/kaio-{motion,attacks,reactions}-v4-{0,1}.png` e `kaio-kicks-v4.png`.
- `public/assets/fighters/luma-{motion,attacks,reactions}-v4-{0,1}.png` e `luma-lowkick-v4.png`.
- `public/assets/fighters/joao-v4-final.png`.
- Metadados: `public/assets/fighters/{kaio,luma,joao}-v4.json` e `src/data/frameScalesV4.json`.
- Retrato de João: `public/assets/portraits/joao-menu-v2.png`; prompt em [JOAO-PORTRAIT.md](JOAO-PORTRAIT.md).

Os atlas anteriores foram preservados. `.tools/build-v4-atlas.cjs` calcula recortes, pivôs e escala a partir do alfa das imagens, sem alterar os bitmaps. A caminhada mantém a altura visível de 128 unidades para El Felpo/Gusta e 132 para João. O canvas usa suavização e resolução adaptada ao tamanho da tela.

Há reaproveitamento de poses: algumas linhas geradas possuem sete desenhos para oito posições de animação; a recuperação repete o último desenho. João usa dezesseis poses. Os novos golpes direcionais, especiais e finalização combinam poses existentes, com tempos de preparação, impacto e recuperação. Não são sequências inteiramente novas desenhadas quadro a quadro.

## Combate

- Golpes leves conectados podem cancelar em médios, e médios em fortes, mantendo a postura.
- Frente + MP: overhead. Frente + HP: lançamento com cancelamento em salto ao acertar. Trás + HK: chute giratório de dois impactos.
- Baixo, neutro, baixo + chute: especial exclusivo por personagem, custo de 40 de energia.
- O contador mostra os golpes e o dano do combo. Golpes de múltiplos impactos alternam poses entre contatos.
- Vitória final por nocaute, no chão e a até 200 unidades: HP + HK durante o aviso executa uma finalização opcional animada. Não muda o placar. Não há desmembramento; o efeito de sangue é estilizado e pode ser desligado.
- O guia no menu, pausa e treino mostra comandos relativos ao adversário e teclas configuradas.

## Pendência de referências

A pasta `personagens` mencionada pelo usuário não foi localizada no projeto. O redesenho conforme essas referências e a nova capa dos três lutadores trocando socos ainda dependem do caminho dessa pasta. A arte V4 acima usa as referências já existentes no jogo.
