# Como adicionar um cenário

Cenários ficam em `js/data/stages.js` (ou num arquivo novo incluído no `index.html` depois dele).

```js
VA.registerStage({
  id: 'mansao', name: 'A Mansão Viva', music: 'entre',     // faixas: menu, select, city, lab, entre, prison, victory
  desc: 'Texto da seleção.',
  canon: 'De onde vem no livro e o que é proposta.',
  width: 1000,                         // largura da arena (limites de combate)
  unlock: null,                        // ou um texto; libere com Save.unlock('stages', 'mansao')
  init(m) {},                          // cria caches (camadas) e o estado do cenário
  update(m) {},                        // animação por quadro (60 Hz)
  drawBack(ctx, m, cam, zoom, sx, sy) {},  // céu e camadas com paralaxe (coordenadas de tela)
  drawFloor(ctx, m) {},                // chão em coordenadas do mundo (y = GROUND é o piso)
  drawFront(ctx, m) {},                // primeiro plano (poeira, neblina)
  onImpact(m, x, power) {},            // alguém caiu / foi arremessado / supremo: quebre coisas aqui
});
```

## Paralaxe

Dentro de `stages.js` existem dois ajudantes:

- `layer(w, h, fn)` desenha uma camada estática **uma vez** num canvas fora da tela (rápido).
- `par(ctx, img, cam, zoom, sx, sy, fator, y)` desenha a camada com deslocamento `cam.x * fator`
  (0 = parada no horizonte, 1 = acompanha o chão).
- `setPar(ctx, cam, zoom, sx, sy, fator)` prepara a transformação para desenhar elementos animados na
  mesma profundidade (letreiros, drones, silhuetas).

Use `LW(stage, fator)` para a largura necessária de uma camada.

## Partes interativas

`onImpact` é chamado quando um lutador cai no chão (`power` 1), em pisões pesados e nos supremos
(`power` 2–3). Exemplos já prontos: carros que amassam e rachaduras no asfalto (Avenida), tubos de
contenção que quebram e vazam (Agência), ondas no chão espelhado (O Entre) e a rachadura que cresce
(Prisão). Para iluminação reativa, leia o estado da luta em `drawBack` (a Agência acende o alarme
quando alguém está com menos de 25% de vida).

## Desbloqueio e Arcade

- Cenário com `unlock` aparece com cadeado até `Save.unlock('stages', id)` ser chamado
  (veja `arcadeResult` em `js/modes.js`).
- Use o id no campo `stage` das lutas de `arcade.ladder` de um personagem.
