> **Novo neste repositório:** [STICKER POWERS: O Despertar dos Poderes](sticker-powers/README.md), um jogo de stickers colecionáveis com batalhas. Para jogar, abra `sticker-powers/index.html`.

# V — O Homem Que Acordou Grande Demais (o jogo)

Jogo de aventura em pixel art baseado no romance *V — O Homem Que Acordou Grande Demais*.
Cobre o **Ato I completo e o início do Ato II (capítulos 1 a 11)**, do copo que para no ar até a volta do Téo.

> "Eu prefiro carregar a culpa de ter feito, do que a culpa de não ter feito nada." — V

## Como jogar

Abra o `index.html` num navegador (Chrome, Edge, Firefox ou Safari). Não precisa instalar nada.
Ele roda no computador e no celular (com joystick e botões na tela).

Para servir localmente: `npx http-server .` e acesse `http://localhost:8080`.

### Controles

| Tecla | Ação |
|---|---|
| WASD / setas | Andar |
| E / Espaço | Interagir, avançar diálogo |
| Q | **Telecinese**: pegar e arremessar (E pousa) |
| R | **Desfazer**: rebobina os últimos segundos de objetos próximos |
| Shift | **Deslocar**: aparece do outro lado sem percorrer o caminho |
| C | **Criar**: laranja, milho, sorvete... |
| X | **Percepção**: paredes transparentes, o "formato da vida" das pessoas |
| F | **Parar o tempo** |
| B | **Chamar a Van**: ela dá a dica certa pelo rádio |
| J / Tab | Diário (missões, caderno, poderes) |
| Esc / P | Pausa · M liga/desliga o som |

## O que tem no jogo

- **11 capítulos jogáveis** fiéis ao livro: O Copo, Testes Domésticos, A Van, Gustavo, A Mansão Viva,
  O Que Se Faz Com Isso, A Culpa Que Eu Plantei, A Ligação das Onze e Quarenta, Velório,
  A Porta Que Não Devia Abrir e Téo.
- **O V igual à referência**: cabelo grisalho bagunçado, jaqueta oliva, camisa verde-acinzentada, jeans escuro,
  botas marrons, barba por fazer e olhar cansado. O retrato dos diálogos é recortado da arte original (`assets/`).
- **Poderes que entram na história**, liberados na ordem em que aparecem no livro, com brasas e fumaça escura.
- **Missões secundárias**: o boleto, o sorvete, o senhor dos pombos, o semáforo (meio segundo), Pipoca (o cachorro sumido),
  o envelope da Dona Cida, as pizzas do entregador, a pipa do Lucas, o fliperama "Estrada 2" e as 8 páginas soltas do caderno.
- **Cenários vivos**: pedestres com rotina, fila na padaria, pombos que fogem e voltam, carros que respeitam o semáforo,
  cachorro latindo pra moto de entrega, vizinho lavando o carro, dia e noite com iluminação dinâmica.
- **Sequências especiais**: segurar a tarde de 2009 (a avó sumindo), o videogame com o Gustavo, o caderno de 40 páginas,
  a manipulação de ideias dentro da cabeça do Gustavo, as mensagens dos onze dias, os argumentos das quinze horas e "sentir falta".
- **A Van** conversa por faróis (1 = sim, 2 = não), rádio, limpador de para-brisa e buzina.
- Salvamento automático por capítulo, seleção de capítulos já alcançados e música e efeitos sonoros procedurais.

## Estrutura

```
index.html, style.css     interface
js/core.js                laço, entrada, áudio procedural, salvamento
js/art.js                 todos os sprites e cenários desenhados por código
js/world.js               mapas, colisão, entidades, iluminação
js/powers.js              os poderes do V
js/ui.js                  diálogos, HUD, diário, toque
js/maps.js                apartamento, rua, Mansão, hospital, velório, cemitério
js/story.js               sistema de história, interações, população da rua
js/chapters1-3.js         roteiro dos capítulos 1 a 11
js/minigames.js           sequências especiais
assets/                   retrato e arte de referência do V
```

Atalho de teste: `index.html?cap=6` começa direto no capítulo 6.
