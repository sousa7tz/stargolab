# StargoLab.

Landing page oficial da **StargoLab.** ([stargolab.com.br](https://stargolab.com.br)) e demos de landing pages por nicho, para empresas locais brasileiras. Site estático em HTML, CSS e JavaScript puro, publicado no Netlify.

| Página | Caminho |
|---|---|
| Home | `/` |
| Apex Gym (academias) | `/demo/gym/` |
| Lúmina Odontologia (clínicas) | `/demo/clinic/` |
| Navalha Barber Club (barbearias) | `/demo/barbershop/` |

## Como rodar

Requer Node 22+.

```bash
npm install
npm run dev       # edita e visualiza src/ em http://localhost:3000
npm run preview   # gera o build e serve dist/ em http://localhost:4173
```

## Estrutura

```
src/          fonte do site (é o que você edita)
dist/         saída do build (gerada, fora do git)
scripts/      build, servidor local e gerador de demos
templates/    molde de demo nova
```

## Build

`npm run build` gera `dist/` a partir de `src/`:

- minifica HTML, CSS e JS;
- versiona os assets pelo conteúdo (`style.css?v=<hash>`) para permitir cache de 1 ano;
- valida as páginas e **falha** se houver link quebrado, imagem sem `alt`/dimensões, link externo sem `rel="noopener"` ou metas obrigatórias faltando.

## Nova demo

```bash
npm run new:demo -- restaurant "Casa Brasa"
```

Cria `src/demo/restaurant/` a partir do molde, já com menu acessível, animações, `noindex` e links de WhatsApp. Depois é só ajustar textos, cores e imagens e linkar a demo na seção `#demos` da home.

## Deploy

O Netlify roda `npm run build` e publica `dist/` (ver `netlify.toml`). Cada Pull Request ganha um deploy preview; o merge na `main` publica em produção.

## Contribuição

Veja o [CLAUDE.md](CLAUDE.md): branch por alteração (`<tipo>/<descricao>`), Conventional Commits e PR para a `main`.
