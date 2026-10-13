# STICKER POWERS: O Despertar dos Poderes

Jogo de navegador de **stickers colecionáveis com poderes elementais**: abra pacotes, complete o álbum, evolua seus personagens e enfrente adversários e chefes em batalhas por turnos.

Feito com HTML, CSS e JavaScript puros, sem dependências, sem build e sem chaves de API. As ilustrações de todos os stickers, fusões e chefes são desenhadas em **SVG pelo próprio código**, e a música e os efeitos sonoros são **sintetizados em tempo real** (Web Audio API). Nada é baixado da internet.

## Como executar

**Opção 1 (mais simples):** abra o arquivo `sticker-powers/index.html` no Chrome, Edge, Firefox ou Safari (computador ou celular).

**Opção 2 (servidor local):**
```bash
cd sticker-powers
npx http-server .     # ou: python3 -m http.server 8080
```
Depois acesse `http://localhost:8080`.

## Como jogar

1. **Comece** com 3 stickers e 300 moedas. Abra o **Pacote Diário** (grátis uma vez por dia).
2. **Jogar** leva direto para a próxima fase da campanha: **80 fases em 16 regiões**, divididas em Ato I (fases 1–20), Ato II (21–40), Ato III — Além da Borda (41–60) e Ato IV — A Porta (61–80), cada ato liberado ao vencer o anterior. Escolha até 3 stickers e lute.
3. Em combate, cada sticker tem **Atacar** (+1 energia), **Habilidade** (gasta energia) e **Defender** (−50% de dano, +1 energia). Toque no alvo quando for pedido. Há velocidade 1×/2×/3× e modo **AUTO**.
4. Vitórias dão **moedas, XP e fragmentos**. Duplicatas de pacotes viram **fragmentos**.
5. Em **Melhorias**: treine (moedas → XP), **evolua** até 7 estrelas (nível máximo + moedas + fragmentos; as estrelas 4 a 7 também pedem Essência, e a 6ª e a 7ª pedem Cristais) ou use a **Forja** para criar um sticker que falta. **⏩ Treinar ao máximo** gasta as moedas treinando até acabar o dinheiro ou chegar ao limite da estrela, e **⏫ Treinar e evoluir ao máximo** faz tudo em sequência e diz por que parou.
6. Derrote os **16 chefes** (a cada 5 fases) para ganhar Essência e um **sticker exclusivo**. Depois, desafie-os em níveis cada vez mais altos na aba **Chefes**.
7. Zerou? Encare o **Modo Pesadelo** (as 40 fases com inimigos muito mais fortes e regras especiais), suba a **Torre Infinita** ou chame alguém para um **Duelo Local** no mesmo aparelho.
8. Use os **Cristais** do Pesadelo para comprar **Molduras** animadas para as cartas.
9. No **🧬 Laboratório de Fusão** (em Melhorias), una dois stickers com 3★ ou mais num sticker Secreto novo. Os originais continuam com você.
10. Toda semana há um **🌍 Chefe Mundial** gigante: 3 tentativas por dia, 10 rodadas cada, e a recompensa depende do dano causado.
11. Resgate recompensas em **Missões** (diárias e conquistas).

## Sistemas

| Sistema | O que tem |
|---|---|
| **Stickers** | 88 no álbum (72 em pacotes e 16 exclusivos de chefes), mais as fusões e os segredos, cada um com arte SVG própria, história, papel, atributos e uma habilidade exclusiva que realmente funciona em combate |
| **Raridades** | Comum, Incomum, Raro, Épico, Lendário, Mítico e Secreto, cada uma com borda, brilho, partículas e som de revelação próprios (Lendário+ tem borda giratória; Mítico e Secreto têm holográfico; Secreto tem arco-íris e brilho estelar) |
| **Elementos** | 15: Fogo, Água, Gelo, Raio, Terra, Vento, Luz, Trevas, Natureza, Plasma, Gravidade, Tempo, Cósmico, Veneno e Metal, com cores, ícones e partículas próprios. Vantagem = ×1,5 de dano; resistência = ×0,7 |
| **Pacotes** | Diário (grátis), Básico, Fúria, Maré, Astral (por elemento), Evento semanal (elementos em destaque com peso 3×), Premium (último slot garantido Raro+) e Cósmico (pago com Essência). As chances exatas aparecem em “Probabilidades” |
| **Coleção** | Busca, filtro por raridade, elemento, obtidos/faltando e favoritos; ordenação por nº, poder, raridade, nível e nome; porcentagem de conclusão e progresso por elemento; silhuetas para os que faltam; detalhes com carta 3D; comparação lado a lado |
| **Combate** | Turnos por velocidade (com linha do tempo), energia, queimadura, veneno acumulável, congelar, atordoar, enfraquecer, lentidão, escudo, espinhos, provocação, esquiva, cura, regeneração, reviver, roubo de energia, turno extra e atraso de turno. IA escolhe alvos por vantagem elemental e vida baixa, cura aliados feridos e se protege. A partir da rodada 15, a “Fúria da Arena” aumenta o dano para evitar empates eternos |
| **Chefes** | Ato I: Dragão do Apocalipse, Imperador do Vazio, Deusa do Tempo e Colosso das Sombras. Ato II: Hidra Abissal, Rainha das Tempestades, Titã de Aço e Ômega, o Devorador. Ato III (inspirado no índice do livro *V*): Fray, o Desdobrador, General Voss, A Sombra do Imperador e O Imperador Estelar. Ato IV (também inspirado no livro): A Plateia, O Rei Coelho, Trigg e O Nível de Cima. Todos com tela de apresentação, 2 ações por rodada, padrão de ataques próprio, fase de fúria abaixo de 50% de vida, desafios repetíveis de nível crescente e recompensas exclusivas |
| **Evolução** | Níveis 1–70 (limite de 10 por estrela, até 7 estrelas). Estrela 2 desbloqueia o **talento elemental** (ex.: Fogo queima com ataques normais, Luz regenera) e o brilho holográfico; estrela 3 desperta a habilidade (+25% de poder, custo −1) e adiciona uma aura animada; estrela 4 dá moldura de cristal; estrela 5 é a **Forma Suprema** (+50% de poder na habilidade e coroa de luz); estrela 6 é **Transcendente** (nível 60, +75% de poder e aura arco-íris); estrela 7 é **Divina** (nível 70, +100% de poder e asas de luz). Há botões para treinar e evoluir ao máximo de uma vez. Custos e ganhos são mostrados antes de confirmar |
| **Modo Pesadelo** | Liberado ao vencer a fase 40: as 40 fases dos Atos I e II voltam com inimigos Nv 44–58 que lutam com força de Mítico e 1–2 regras por fase (Fúria Precoce, Espinhos, Vampirismo, Ferida Aberta, Blindados, Ar Tóxico, Gigantes, Velozes, Inimigos Carregados). Dá Cristais, em dobro na 1ª vitória |
| **Duelo Local** | 2 jogadores no mesmo aparelho, com modo Equilibrado (todos no Nv 30, 3★) ou com os níveis da coleção. Sem recompensas |
| **Molduras** | 10 molduras animadas (Neon, Ouro Real, Chamas, Cristal de Gelo, Galáxia, Pixel Retrô, Aurora…), escolhidas por sticker na ficha. Duas só saem por conquistas |
| **Animações** | Projéteis com rastro de cada elemento, cortes nos ataques, cut-in estilo anime nas habilidades e golpes de chefe, pacote que rasga ao meio, cartas que voam do pacote, raios de luz atrás de Lendários ou melhores, barras de XP que enchem no resultado e ícones de elementos flutuando na tela inicial |
| **Fusões** | 8 receitas (ex.: Inferno Rex + Rainha do Gelo) em que nasce um **personagem novo** (arte própria, que mistura traços dos dois, como nas fusões de anime), Secreto e com habilidade própria. A animação junta as duas cartas, mostra a silhueta do novo ser e depois revela as cores. Pedem os dois stickers com 3★+, 25 mil moedas, 600 fragmentos e 6 de Essência. Existe ainda uma receita que só aparece para quem tem as peças certas |
| **Chefe Mundial** | Um dos 16 chefes por semana, gigante (Nv 65, vida ×40) e com uma regra do Pesadelo. Ninguém o derrota: cause o máximo de dano em 10 rodadas. 5 faixas de recompensa (10 mil a 250 mil de dano) e recorde semanal |
| **Sinergias** | 2 stickers do mesmo elemento na equipe: +10% de ataque; 3: +20% de ataque e +10% de vida. Vale também para os inimigos |
| **Torre Infinita** | Pós-jogo sem fim: inimigos cada vez mais fortes, chefe a cada 10 andares (com Essência e Pacote Premium), checkpoints a cada 10 andares e recorde salvo |
| **Missões** | 4 diárias (reiniciam à meia-noite pelo relógio do dispositivo) e 49 conquistas, incluindo cada ato, Torre, fusões, Chefe Mundial e álbum completo, com recompensas em moedas, fragmentos, essência e pacotes |
| **Áudio** | Música procedural (menu, batalha, chefe) e efeitos para cliques, pacotes, raridades, golpes, cada elemento, cura, vitória, derrota, nível e evolução. Música, efeitos e volume são ajustáveis |
| **Salvamento** | Automático no `localStorage`, com cópia de segurança, validação de dados corrompidos, exportar/importar e reinício com confirmação |

### Um segredo

Existem stickers que não estão no álbum (cada vez mais deles), não saem em pacotes, não podem ser forjados e não aparecem nem como silhueta. Eles vêm de outra história. Quem os encontrar vai saber.

### Sobre raridade

A raridade de cada sticker é fixa. Não existe mecânica para “subir” a raridade: o crescimento vem de níveis e estrelas.

### Economia

Só existem moedas fictícias, sem compras reais nem anúncios. Uma vitória rápida rende cerca de 60 a 290 moedas, uma fase nova rende mais, e o Pacote Básico custa 100. Fragmentos de duplicatas pagam evoluções e a Forja, então dá para completar o álbum só jogando.

### Limitações honestas

- **Sem servidor:** o progresso fica só neste navegador e **não é sincronizado** entre dispositivos (use Exportar/Importar).
- O Pacote Diário, as missões diárias e o evento semanal usam o **relógio do dispositivo**. Voltar o relógio não libera outro pacote, mas adiantá-lo libera (é um jogo offline de um jogador).
- O áudio só começa após o primeiro toque ou clique, por regra dos navegadores.

## Testes

```bash
cd sticker-powers
node tests/run-tests.js      # 83 testes de lógica (sem navegador)
```
Cobrem dados, as 80 fases, os 16 chefes, a Torre Infinita, a evolução até 7 estrelas, fusões, Chefe Mundial, sinergias, probabilidades (incluindo 200 mil sorteios comparados com as chances exibidas), garantia do Premium, pacote diário, duplicatas, evolução, forja, cada efeito de combate, vantagens elementais, chefes, IA, mil batalhas simuladas, recompensas, missões diárias, salvamento, save corrompido e exportar/importar.

```bash
npm i -D playwright && npx playwright install chromium
node tests/e2e.js            # percorre o jogo inteiro num navegador real
```
O teste de ponta a ponta abre pacotes, usa filtros, compara, joga fases, um chefe e a Torre, abre os Atos II e IV, faz uma fusão, enfrenta o Chefe Mundial, desiste de uma batalha, treina, evolui, forja, resgata missões, mexe nas configurações, recarrega a página para conferir o salvamento, exporta/importa, reinicia e verifica o layout em 390×844 (celular) sem rolagem horizontal e sem erros no console.

## Estrutura

```
sticker-powers/
├── index.html          página única
├── css/style.css       visual, cartas, raridades, animações, responsivo
├── js/data.js          raridades, elementos, stickers, fusões, chefes, fases, pacotes, missões
├── js/core.js          estado, salvamento, economia, pacotes, progressão, missões
├── js/battle.js        motor de batalha por turnos e IA (sem DOM)
├── js/art.js           ilustrações SVG dos stickers e chefes do Ato I, ícones
├── js/art2.js          ilustrações SVG do Ato II e dos segredos
├── js/art3.js          ilustrações SVG do Ato III
├── js/art4.js          ilustrações SVG do Ato IV e das fusões
├── js/audio.js         efeitos e música sintetizados
├── js/fx.js            partículas em canvas, clarões e tremores
├── js/ui.js            navegação, cartas, tela inicial, coleção, detalhes, comparação
├── js/ui-packs.js      loja, abertura animada, probabilidades e histórico
├── js/ui-battle.js     campanha, chefes, seleção de equipe e combate animado
├── js/ui-progress.js   treino, evolução, forja, fusão, molduras, missões e configurações
├── js/main.js          inicialização
└── tests/              testes de lógica e de ponta a ponta
```

Para ajustar o balanceamento, edite `js/data.js`: taxas dos pacotes (`SP.RATES`), custos (`SP.PROG`), recompensas das fases (`SP.stageInfo`), atributos dos chefes e habilidades dos stickers. A tela de probabilidades lê esses mesmos valores, então continua sempre correta.
