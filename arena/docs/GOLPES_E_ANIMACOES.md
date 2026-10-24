# Golpes, animações, supremos e transformações

## Anatomia de um golpe

```js
sp_fwd: {
  name: 'Meio Segundo',
  type: 'special',            // normal | special | super | throw | transform
  cmd: '→ + U',               // texto na lista de golpes
  startup: 7, active: 10, recovery: 16,   // quadros (60 = 1 s). total = soma (ou `total`)
  box: { x: 4, y: -84, w: 40, h: 22 },    // caixa de ataque, relativa aos pés (y negativo = acima)
  hit: { dmg: 85, stun: 22, bstun: 16, push: 8, level: 'mid', knock: false, chip: 10, hitstop: 8 },
  motion: [{ f0: 4, f1: 16, vx: 9 }],     // deslocamento por quadro (vx para a frente, vy para cima negativo)
  anim: ['straight_a', 'dash_b'],         // pose de preparação e pose do golpe
  cost: 0, cooldown: 0, oneProj: false,
  cancel: ['super'],                      // em que tipos pode ser cancelado depois de acertar
}
```

### Campos de `hit`

| campo | efeito |
|---|---|
| `dmg` | dano base (escala para baixo em combos longos) |
| `stun` / `bstun` | quadros de atordoamento no acerto / na defesa |
| `push` | empurrão (no canto, quem é empurrado é o atacante) |
| `level` | `mid`, `low` (defender agachado), `high` (defender em pé) |
| `knock` | `false`, `'knock'` (derruba), `'sweep'` (rasteira), `'launch'` (lança para combo aéreo) |
| `launch` | `{ vx, vy }` personalizado para o lançamento |
| `chip` | dano na defesa (nunca nocauteia) |
| `unblockable` | não pode ser defendido |
| `hitstop` | quadros de congelamento no impacto |
| `juggle` | pontos de malabarismo (acima de 6 o alvo fica intocável até cair) |
| `lockOnHit` | `{ dur, script, onEnd }` — prende o alvo numa sequência (supremos) |
| `onHit(att, def, match)` | código extra no acerto |

### Vários acertos
```js
hits: [
  { f: 4, len: 3, box: {...}, dmg: 60 },
  { f: 7, len: 4, box: {...}, dmg: 50, knock: 'launch' },
]
```

### Propriedades especiais
- `invuln: [f0, f1]` invencível a golpes · `projInvuln` só a projéteis · `throwInvuln: true`.
- `armor: { f0, f1, hits, cond(f) }` absorve golpes sem atordoar · `onArmor(f, att, m)`.
- `counter: { f0, f1, proj, on(self, att, match, src) }` postura de contra-ataque (ex.: Desfazer).
- `parry: { f0, f1, proj, energy, on() }` anula o golpe (ex.: Nada Me Toca).
- `hideFrames: [f0, f1]` personagem some (teleportes) · `freeCancel: [f0, f1]` qualquer ação liberada.
- `events: { 13: (f, match) => {...} }` código em quadros específicos (projéteis, efeitos).
- `airOk: true` pode ser usado no ar · `air: true` golpe exclusivamente aéreo · `crouch: true` agachado.
- `noPush: true` atravessa o adversário · `hurtLow: 40` corpo baixo (rasteiras).
- `cond(f)` condição para poder usar · `formCost: { forma: custo }` custo diferente numa forma.
- `formVariant: { forma: {...} }` versão aprimorada durante uma transformação (herda o resto).
- `drawFx(ctx, f, quadro)` efeito visual próprio (escudos, auras).

### Agarrões
`type: 'throw'` (comum, pode ser escapado com L + J) ou um especial com
`hits: [{ f, len, grab: true, range, unblockable: true, dmg }]`, opcionalmente com
`grabScript(att, alvo, t, match)` e `grabDur`.

### Projéteis
Dentro de um `event`:
```js
match.projectiles.push(VA.makeProjectile(f, {
  cx: f.x + f.facing * 34, cy: f.y - 66, w: 22, h: 20, speed: 6.5, life: 140,
  hits: 1, rehit: 10, activeFrom: 0, counts: true, clash: true,
  hit: { dmg: 70, chip: 9 }, draw(ctx, p, match) {...}, update(p, match) {...},
}));
```
`activeFrom` cria ataques com aviso (pilares, sombras). `counts: false` não conta para `oneProj`.

## Supremos cinematográficos

```js
su: {
  type: 'super', cost: 300,
  cinematic: { dur: 50, zoom: 1.6, text: 'NOME', color: '#fff', isSuper: true, say: 'Nome' },
  startup: 6, active: 14, recovery: 30, box: {...}, motion: [...],
  hit: { dmg: 40, lockOnHit: { dur: 100, script(att, alvo, t, match) {...}, onEnd(att, alvo, match) {...} } },
}
```
Sequência do motor: confere a energia → congela o tempo e aproxima a câmera (`cinematic`) com faixa e
retrato → executa a investida → se acertar, roda o `script` por `dur` quadros (use
`VA.Combat.scriptHit(att, alvo, { dmg, power, color }, match)` para cada impacto, `match.focus` para a
câmera, `match.timeStop`/`match.darkT` para o mundo cinza/escuro) → solta o alvo e a luta continua.
Se errar, o lutador fica na recuperação (punível).

## Transformações e estados especiais

```js
forms: {
  grande: {
    name: 'Grande Demais', duration: 720, color: '#fff', desc: '...',
    auto: f => false,                  // ativa sozinha quando verdadeiro (ex.: Rachadura do Trigg)
    mods: { speed: 1.15, damage: 1.18, defense: 0.9 }, energyMul: 0.5,
    look: { hair: '#eee', eyeGlow: '#fff' }, trail: '#8f7bff',
    aura(f) { FX.aura(...) }, onEnter(f, match) {},
  },
},
moves: { transform: { type: 'transform', cost: 200, cond: f => f.hp <= f.maxHp * 0.5,
         cinematic: { ..., onTick(o, m, t) { if (t === 40) o.enterForm('grande'); } } } }
```

## Animação (esqueleto)

As poses ficam em `js/render/poses.js`. Campos em graus: `lean` (tronco), `head`, `sF/eF` (ombro e
cotovelo da frente), `sB/eB` (de trás), `hF/kF`, `hB/kB` (quadris e joelhos), `rot` (corpo inteiro),
`x`/`y` (deslocamento). 0° = membro para baixo; positivo = para a frente.

- `anim: ['pose_a', 'pose_b']`: interpola base → `pose_a` na preparação, `pose_b` no ativo, volta na recuperação.
- `keys: [[0, 'stance'], [6, 'slide'], [22, 'slide'], [36, 'crouch']]`: chaves livres por quadro.
- Poses próprias de um personagem: `poses: { stance: {...} }` na ficha.
- Caminhada, corrida, pulo, defesa, dano, queda, levantar, tontura, vitória e derrota são automáticas.

Ative **Mostrar caixas de colisão** na pausa para ver corpo (azul), ataque (vermelho), empurrão
(amarelo) e projéteis (rosa) enquanto ajusta os números.
