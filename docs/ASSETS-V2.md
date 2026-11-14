# Assets V2

Gerados com a ferramenta integrada image_gen, usando as folhas originais como referência de identidade. Arquivos originais preservados.

- `public/assets/portraits/el-felpo.png`: ilustração dedicada de corpo inteiro, transparente.
- `public/assets/portraits/gusta.png`: ilustração dedicada de corpo inteiro, transparente.
- `public/assets/fighters/kaio-v2.png` e `luma-v2.png`: grade de 8 colunas e 12 linhas, 96 quadros, PNG real de 916 × 1717. Os JSONs ao lado contêm os recortes calculados nas dimensões reais; não usar os tamanhos pedidos ao gerador como se fossem os tamanhos recebidos.

Prompt dos retratos: manter rosto, cabelo, barba/bigode e roupas da referência; personagem único em guarda, corpo inteiro, pixel art arcade original, transparência real, sem cenário, texto, grade ou sombras.

Prompt das folhas: grade 8 × 12; grupos de quatro quadros por ataque com preparação, contato e recuperação; 18 normais na ordem em pé/agachado/aéreo, cada postura LP/MP/HP/LK/MK/HK; quatro especiais projétil/antiaéreo/avanço/super; oito poses finais de guarda, caminhada, bloqueio, dano e queda. Identidade e escala consistentes, todos voltados para a direita, transparência real e nenhum efeito incorporado.

O manifesto usa IDs individuais de golpe. A pose de contato é mantida no intervalo ativo, e a duração visual segue a simulação. O renderizador procura o último pixel opaco por quadro para alinhar os pés ao piso. Isso corrige variação de margem inferior, mas não substitui revisão artística quadro a quadro.

Na revisão visual, as linhas geradas não tinham intervalos verticais uniformes. Os retângulos dos atlas foram corrigidos a partir das 12 faixas de pixels opacos de cada imagem, com margem, evitando cortes de cabeça e pés. Não regenere os JSONs dividindo simplesmente a altura por 12. Uma captura da integração está em `docs/luta-v2.png`.

Limitação artística: quatro poses por golpe são uma expansão das folhas originais, não animação de produção com 8–12 desenhos por golpe. Algumas reações, agarrão e parry ainda reaproveitam poses; a galeria permite revisar os assets disponíveis. O menu usa ilustrações completas dedicadas; não foram gerados bustos separados.
