# Como adicionar um personagem

Cada lutador é **um arquivo de dados** em `js/data/characters/`. O motor não precisa ser alterado.

## Passo a passo

1. **Crie a ficha** `js/data/characters/fray.js` (use `rayan.js` como modelo — é o mais curto).
2. **Inclua o script** em `index.html`, junto dos outros personagens:
   ```html
   <script src="js/data/characters/fray.js"></script>
   ```
   A ordem dos `<script>` de personagens é a ordem da tela de seleção.
3. **Pronto**: ele aparece na seleção, na Galeria, na lista de golpes, no modo Treino, na Sobrevivência
   e pode ser adversário no Arcade dos outros (basta citá-lo na `ladder` deles).

## Estrutura mínima

```js
'use strict';
(function () {
  VA.registerCharacter({
    id: 'fray',                       // único, minúsculo, sem espaços
    name: 'Fray',
    alias: null,                      // opcional (ex.: 'Eclipse')
    title: 'O Homem Que Desdobrou a Avenida',
    locked: false,                    // true = precisa ser desbloqueado
    unlockHint: '',                   // texto mostrado quando bloqueado

    // SEPARE o que é do livro do que é invenção do jogo
    canon:    { bio: '...', appearance: '...', facts: ['Cap. 26 — ...'] },
    proposal: { bio: '', style: 'Como ele luta (proposta).', notes: 'O que foi inventado.' },

    stats: { speed: 6, power: 7, defense: 5, reach: 6, energy: 6 },   // 1–10, só para exibição
    health: 1000,
    energyGain: 1,                    // multiplicador de ganho de energia
    physics: { walk: 2.4, back: 1.9, run: 5.2, backdash: 5.5, jumpV: -10, jumpH: 3.1,
               gravity: 0.55, width: 30, height: 100, crouchHeight: 64, throwRange: 52 },

    look: { /* ver "Aparência" abaixo */ },
    introPose: 'stance', winPose: 'win',
    quotes: { intro: ['...'], win: ['...'] },

    moves: { /* ver GOLPES_E_ANIMACOES.md */ },
    forms: { /* transformações / estados especiais (opcional) */ },

    ai: { range: 75, aggression: 0.55, zoning: 0.3, projectile: 'sp', approach: 'sp_fwd',
          antiAir: 'sp_down', projAnswer: null, counter: null, grab: null, tricks: [],
          superRange: 140, combos: [['lp', 'hp', 'sp_fwd']], pressure: ['lp', 'clp'] },

    rivals: [{ id: 'v', canon: true, text: '...' }],
    arcade: {
      ladder: [
        { char: 'rayan', stage: 'agencia', intro: 'Texto antes da luta.' },
        { char: 'v', stage: 'cidade', boss: true, intro: '...' },
      ],
      ending: { title: '...', proposal: true, text: ['parágrafo 1', 'parágrafo 2'] },
    },
  });
})();
```

## Golpes herdados

Todo personagem herda de `js/data/moves_common.js`: `lp`, `hp`, `lk`, `hk`, `clp`, `chk`, `air_l`,
`air_h` e `throw`. Na ficha você só escreve o que muda — o resto é mesclado:

```js
moves: {
  hp: { name: 'Martelo', startup: 12, hit: { dmg: 110 } },   // muda só esses campos
  lk: null,                                                   // remove o golpe
}
```
Use `inheritCommon: false` para não herdar nada.

## Comandos (como o jogador executa cada id)

| id | entrada (J1 padrão) |
|---|---|
| `lp` / `hp` | J / K |
| `lk` / `hk` | → + J / → + K |
| `clp` / `chk` | ↓ + J / ↓ + K |
| `air_l` / `air_h` | J / K no ar |
| `throw` | L + J perto |
| `sp`, `sp_fwd`, `sp_back`, `sp_down` | U, → + U, ← + U, ↓ + U |
| `sp2`, `sp2_fwd`, `sp2_back`, `sp2_down` | I, → + I, ← + I, ↓ + I |
| `su` | O |
| `transform` | ↓ + O |

Ids fora dessa tabela (ex.: `eternity_strike` do Trigg) só podem ser iniciados por código
(`f.startMove('id')`), úteis para golpes encadeados automaticamente.
O campo `cmd` do golpe é o texto mostrado na lista de golpes (letras J K U I O L são trocadas
pelas teclas configuradas pelo jogador).

## Aparência (arte provisória por esqueleto)

```js
look: {
  skin, hairStyle: 'messy' | 'hood' | 'shards' | 'ridges', hair, hair2, hood, crown, mask, slit, ridge,
  eye, eyeGlow, brow, stubble,
  top (jaqueta/tronco), sleeve, cuff, shirt, collar, pants, boots, glove, belt,
  spark, spark2 (cor dos impactos), trailColor, fist (tamanho do punho),
  build: { scale, torsoW, hipW, armW, legW, headR, lean },
  extras: { behind(), legs(), torso(), head(), front() },   // desenhos extras (capa, manto, chifres...)
}
```
Novos estilos de cabeça entram em `Rig.HAIR` (`js/render/rig.js`). `lookMod(f, look)` permite
mudar a aparência em tempo real (ex.: as mutações do Kolt). Para trocar por sprites, ver `SPRITES.md`.

## IA

A IA usa os mesmos botões do jogador e lê o perfil `ai`:

- `range` distância preferida; `aggression` 0–1; `zoning` vontade de usar projétil de longe.
- `projectile`, `approach`, `antiAir`, `grab`, `counter`, `projAnswer` (resposta a projéteis): ids de golpes.
- `combos`: listas de ids; a IA só continua depois de confirmar o acerto.
- `pressure`, `tricks`: golpes usados de vez em quando.
A dificuldade (fácil/normal/difícil) muda reação, precisão e erros — não precisa configurar por personagem.

## Ganchos opcionais

- `onRoundStart(f)`, `onUpdate(f, match)` — lógica própria por quadro (ex.: Kolt muta com a vida baixa).
- `f.vars` — variáveis livres do lutador, zeradas a cada round. `f.vars.dmgMul`, `f.vars.defMul`,
  `f.vars.speedMul` são lidas pelo motor.
- `drawFx(ctx, f)` — efeito desenhado sobre o lutador.
