# Substituindo a arte provisória por sprites

Os lutadores são desenhados por um **esqueleto animado** (`js/render/rig.js` + `poses.js`): é arte
provisória, mas toda animada (nada de imagem parada). Quando houver sprites finais, cada personagem pode
trocar o esqueleto por uma **folha de sprites** sem mexer no motor — caixas de colisão e regras continuam
as mesmas.

> A folha `assets/v_sprites.png` do jogo de aventura é de vista de cima (RPG) e não serve para luta
> lateral. As artes do autor (`v_referencia.jpg`, `v_retrato_grande.png`) aparecem na Galeria.

## 1. Monte a folha

- Uma linha por animação, quadros da esquerda para a direita, todos do mesmo tamanho.
- O personagem **olhando para a direita** (o jogo espelha para o outro lado).
- Os pés no mesmo ponto de cada quadro (por padrão: centro da base do quadro).
- Altura sugerida do personagem: ~100 px (a arena tem 640×360). Use `scale` se for maior.

## 2. Declare na ficha

```js
VA.registerCharacter({
  id: 'v',
  ...
  sprite: {
    src: 'assets/sprites/v_luta.png',   // relativo a arena/index.html
    fw: 96, fh: 128,                    // tamanho de um quadro
    ox: 48, oy: 124,                    // ponto dos pés dentro do quadro
    scale: 1,
    anims: {
      idle:   { row: 0, frames: 6, fps: 8 },
      walk:   { row: 1, frames: 8, fps: 12 },
      run:    { row: 2, frames: 8, fps: 16 },
      crouch: { row: 3, frames: 1, fps: 1 },
      air:    { row: 4, frames: 4, fps: 10 },
      block:  { row: 5, frames: 1, fps: 1 },
      hitstun:{ row: 6, frames: 3, fps: 12, loop: false },
      knockdown: { row: 7, frames: 4, fps: 10, loop: false },
      lp:     { row: 8, frames: 5, fps: 20, loop: false },
      sp:     { row: 9, frames: 8, fps: 16, loop: false },
      // ... qualquer id de golpe ou estado
    },
  },
});
```

Também dá para carregar por código: `VA.loadSpriteSheet('v', { src, fw, fh, anims })`.

## 3. Nomes de animação

- **Estados:** `idle`, `intro`, `walk`, `run`, `crouch`, `block`, `cblock`, `jumpsquat`, `air`, `land`,
  `backdash`, `hitstun`, `blockstun`, `air_hit`, `knockdown`, `getup`, `dizzy`, `locked`, `ko`, `win`, `lose`.
- **Golpes:** o próprio id (`lp`, `hp`, `lk`, `hk`, `clp`, `chk`, `air_l`, `air_h`, `throw`, `sp`,
  `sp_fwd`, `sp_down`, `sp2`, `sp2_back`, `sp2_down`, `su`, `transform`...). Nos golpes, o quadro é
  contado a partir do início do golpe, então ajuste `fps` para casar com `startup`/`active`.
- Animação que não existir na folha usa `idle`.

## 4. Erros de carregamento

Se o arquivo não carregar, o jogo mostra um aviso na tela ("Não foi possível carregar os sprites de …
Usando a arte provisória.") e segue com o esqueleto. Nada trava.

Retratos (HUD, seleção, VS) continuam vindo do esqueleto; para usar imagens próprias, troque
`VA.Rig.portrait` por um `drawImage` do retrato desejado.
