# V — The Awakening Arena

Jogo de luta 2D (estilo MUGEN) do universo de **V — O Homem Que Acordou Grande Demais**.
HTML5 + Canvas 2D + JavaScript puro. Sem servidor, sem bibliotecas, sem downloads externos.

## Como rodar

1. Abra `arena/index.html` direto no navegador (Chrome, Edge ou Firefox). Funciona por `file://`.
2. Ou sirva a pasta do projeto e acesse `http://localhost:8080/arena/`:
   - `python3 -m http.server 8080` (na raiz do repositório), ou
   - `npx http-server .`

O jogo de aventura original continua em `index.html` na raiz; o menu do Arena tem um link para ele.

Atalho de teste: `arena/index.html?luta=v,trigg&cenario=prisao&cpu=hard` abre direto uma luta.
Outros parâmetros: `&treino=1` (modo treino), `&p2humano=1` (J2 humano), `&demo=1` (IA x IA).

## Controles (padrão — todos remapeáveis em *Controles*)

| Ação | Jogador 1 | Jogador 2 |
|---|---|---|
| Mover | A / D | ← / → |
| Pular | W | ↑ |
| Agachar | S | ↓ |
| Ataque leve | J | Num 1 |
| Ataque pesado | K | Num 2 |
| Defesa | L | Num 3 |
| Especial | U | Num 4 |
| Especial secundário | I | Num 5 |
| Supremo | O | Num 6 |
| Pausa | Espaço (ou Esc) | Num 0 |

- **Golpes básicos:** J soco rápido · K soco pesado · → + J chute rápido · → + K chute pesado ·
  ↓ + J golpe baixo · ↓ + K rasteira · J/K no ar ataques aéreos · **L + J (perto) agarrão**.
- **Especiais:** U, I, e as variações → + U, ↓ + U, ← + I, ↓ + I (cada personagem tem as suas).
- **Supremo:** O com 3 barras de energia. **Transformação do V:** ↓ + O (vida ≤ 50% e 2 barras).
- **Defesa:** segure L. Golpes baixos exigem L + ↓; ataques aéreos exigem defesa em pé.
- **Correr:** toque duplo para frente. **Esquiva:** toque duplo para trás (invulnerável no início).
- **Escapar de agarrão:** L + J logo no começo do agarrão.
- **Atordoado:** aperte botões e direções para se recuperar mais rápido.
- **Controle de jogo:** padrão Xbox — X leve, Y pesado, A especial, B especial 2, RB/RT supremo,
  LB/LT defesa, Start pausa. O 1º controle é do J1 e o 2º do J2. Menus também navegam pelo controle.
- **Telas de toque:** em celular/tablet aparecem direcional e botões na tela (J1).
- **Tela cheia:** no menu, na pausa ou tecla **F** nos menus.

## Modos

- **Arcade** — sequência de lutas própria de cada personagem até um chefe, com tela de VS, texto de
  introdução, continuações, pontuação e final individual.
- **Versus** — dois jogadores no mesmo teclado (ou controles).
- **Contra a máquina** — escolha o adversário e a dificuldade (Fácil, Normal, Difícil).
- **Sobrevivência** — um round por luta, a vida passa para a próxima luta (+20% de recuperação),
  a IA endurece com as vitórias. Recorde salvo.
- **Treinamento** — boneco configurável (parado, agachado, pulando, defende tudo, defende após o
  1º golpe ou CPU), energia infinita, vida que recupera, caixas de colisão visíveis, dano do último
  golpe, dano do combo, golpes seguidos, maior combo, vantagem de quadros e lista dos comandos executados.
- **Galeria** — fichas (o que é do livro e o que é proposta do jogo), habilidades, rivalidades,
  arte do autor, finais desbloqueados, cenários, resumo dos seis atos e estatísticas.

## Personagens

| | Origem no livro | Estilo (proposta do jogo) |
|---|---|---|
| **V** | Protagonista. Poderes do livro: telecinese, desfazer, deslocar, parar o tempo, "Nada Me Toca", "Legislador Universal". | Equilibrado; cada poder muda uma regra da luta. Forma **Grande Demais**. |
| **Rayan / Eclipse** | Pele azul, aparece do nada na Agência, leva V para O Entre. | Mobilidade: teleportes, fase intangível, orbe e sombra. |
| **Trigg** | Preso na Prisão Fora de Tudo, volta para apagar a possibilidade das coisas. "Não funciona." | Chefe pesado: armadura, apagões no chão, pilares, jaula, agarrão indefensável. Forma passiva **Rachadura**. |
| **Kolt** (desbloqueável) | Não aparece no texto disponível — ficha 100% proposta. | Agarrador com **Mutação** (nível 0–3). |

Fray, General Voss e outros citados no índice aparecem como "em breve" na seleção.

## Desbloqueios (sem grind)

- Termine o **Arcade com qualquer personagem** → libera **Kolt** e o final daquele personagem na Galeria.
- Derrote **Trigg** como chefe no Arcade → libera o cenário **A Prisão Fora de Tudo** para os outros modos.
- Progresso, estatísticas, recordes, controles e configurações ficam no `localStorage` do navegador.

## Estrutura

```
arena/
  index.html               página do jogo (carrega os scripts em ordem)
  css/arena.css            interface
  js/core/                 util (namespace VA, registro), save, input, audio
  js/render/               rig (esqueleto animado), poses, effects (partículas)
  js/engine/               fighter (estados/física/comandos), combat (colisões/dano),
                           match (rounds/câmera/cinemáticas/treino), ai
  js/data/moves_common.js  golpes básicos herdados
  js/data/characters/      uma ficha por personagem (v, rayan, trigg, kolt)
  js/data/stages.js        cenários
  js/data/lore.js          conteúdo do livro para a Galeria
  js/ui/                   hud, telas/menus, toque
  js/modes.js              Arcade, Versus, CPU, Sobrevivência, Treino
  js/main.js               laço de 60 Hz fixo, foco da janela, erros
  docs/                    guias para expandir o jogo
```

## Documentação para expandir

- [`docs/ADICIONAR_PERSONAGEM.md`](docs/ADICIONAR_PERSONAGEM.md) — ficha, golpes, IA, Arcade e final.
- [`docs/GOLPES_E_ANIMACOES.md`](docs/GOLPES_E_ANIMACOES.md) — dados de quadros, caixas, projéteis, supremos, formas, poses.
- [`docs/ADICIONAR_CENARIO.md`](docs/ADICIONAR_CENARIO.md) — camadas, paralaxe, partes destrutíveis.
- [`docs/SPRITES.md`](docs/SPRITES.md) — como trocar a arte provisória por folhas de sprites.

## O que foi testado (automaticamente, no Chromium)

- Inicia sem erros no console, por `http://` e por `file://`.
- Teclado: andar, pular, atacar, defender, especiais, supremo, transformação e pausa pelo J1 e J2.
- 30 verificações de regras: alcance dos golpes, acerto único por golpe, defesa alta/baixa, dano de
  raspão, agarrão vencendo defesa e escape de agarrão, custo de energia (Deslocar 30, Desfazer 50,
  Nada Me Toca 50, Supremo 300, Grande Demais 200), contra-ataque, anulação de projétil, condição e
  duração da transformação, fim de combo infinito, empurrão no canto, K.O., tempo esgotado, fim da
  partida, personagens escolhidos = personagens na luta, armadura, agarrão indefensável, mutação do
  Kolt, teleporte aéreo do Rayan e o "Não funciona" do Trigg contra o V transformado.
- Lutas completas IA x IA em todas as dificuldades: rounds terminam, a IA usa especiais, defende,
  pune, usa supremos e transformações.
- Arcade inteiro (4 lutas, chefe, final, desbloqueio do Kolt e da Prisão), continuar/fim de jogo,
  Sobrevivência (vida carregada + 20%, recorde), Treino (boneco, painel, comandos), Galeria,
  remapeamento de teclas e configurações salvos após recarregar a página.
- Folha de sprites de teste carregando no lugar do esqueleto e aviso quando o arquivo não existe.
- 60 FPS estáveis (pior quadro 16,8 ms) numa luta IA x IA; ~2 ms por quadro de lógica + desenho.
- Controles de toque em tela de celular (andar pelo direcional da tela).

Para repetir os testes de regras: `npm i -D playwright && npx playwright install chromium && node arena/tests/regras.js`.

## Ainda precisa de validação humana

- Sensação das animações, balanceamento fino e dificuldade da IA jogando de verdade.
- Controle físico (Gamepad API): implementado, mas não houve controle disponível no teste.
- Som: os efeitos e músicas tocam sem erro, mas o volume/mixagem precisa ser ouvido.
- Locutor: usa a voz do sistema (`speechSynthesis`); depende do navegador ter voz em português.
- Safari e navegadores móveis reais.

## Limitações conhecidas

- Arte provisória: os lutadores são esqueletos vetoriais animados (sem sprites finais).
  O ponto de troca está pronto (`docs/SPRITES.md`).
- Kolt e todos os estilos de luta são propostas do jogo; Fray, General Voss etc. aparecem só como "em breve".
- O romance no Drive traz o texto do Ato I e início do Ato II; o resto do universo veio do índice.
  Nada além disso foi tratado como fato.
- Dois jogadores no mesmo teclado podem esbarrar no limite de teclas simultâneas (ghosting) de
  teclados baratos; o remapeamento ajuda.
- Não há modo online nem replays.
