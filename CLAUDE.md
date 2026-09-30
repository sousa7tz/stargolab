# CLAUDE.md

Guia de padronização do projeto **StargoLab.** para assistentes de IA (Claude Code e similares).

## Fluxo obrigatório de contribuição (checklist)

Vale para **toda** alteração, inclusive as pequenas (correção de texto, ajuste de cor etc.):

1. **Verificar o estado:** rodar `git status` e `git branch` para confirmar a branch atual e se há alterações não commitadas pendentes. Se houver pendências, avisar o usuário antes de continuar.
2. **Criar branch:** sair da `main` para uma branch nova no padrão `<tipo>/<descricao-em-kebab-case>` (ex.: `feat/hero-section-mobile`). Nunca editar direto na `main`.
3. **Editar só os arquivos em `src/`** (e `scripts/`, `templates/` quando for o caso). Nunca editar `dist/`: é gerada pelo build e não vai para o git.
4. **Rodar `npm run build`** e garantir que passa sem erros (o build também valida as páginas — ver "Build e validação").
5. **Atualizar os escopos:** se a alteração introduzir um escopo novo, adicioná-lo à lista em "Escopos válidos" neste arquivo.
6. **Sugerir o commit:** listar os arquivos alterados e propor a mensagem no padrão Conventional Commits.
7. **Aguardar confirmação:** perguntar se deve prosseguir com `git add` e `git commit`. Só executar com confirmação explícita do usuário.
8. **Instruir a abertura de PR** para a `main`. O Netlify gera uma prévia (deploy preview) do PR. Nunca fazer merge automático.

## Regra obrigatória: Git e commits

- **Nunca edite arquivos nem faça commit diretamente na branch `main`**, mesmo que pareça mais rápido ou a mudança seja pequena. Toda alteração é feita em uma branch nova no padrão `<tipo>/<descricao-em-kebab-case>`.
- **Antes de criar uma branch nova**, sempre rode `git status` e `git branch` para confirmar em qual branch estamos e se não há alterações não commitadas pendentes.
- **Nunca execute `git commit`, `git push`, `git merge`, `git rebase`, `git reset` ou qualquer comando que altere o histórico** automaticamente — nem mesmo se parecer o próximo passo natural.
- Ao terminar uma alteração, liste os arquivos alterados, sugira a mensagem de commit no padrão abaixo e **pergunte se deve prosseguir com `git add` e `git commit`**. Nunca execute esses comandos sem confirmação explícita do usuário na mensagem.
- Toda alteração termina com a **instrução para o usuário abrir um Pull Request para a `main`**. Nunca faça merge automático na `main`.
- Comandos somente leitura (`git status`, `git diff`, `git log`, `git branch`) são permitidos.
- Só faça commit/push se o usuário pedir explicitamente naquela mensagem.

### Padrão de mensagem de commit (Conventional Commits)

```
<tipo>(<escopo>): <descrição curta em inglês, minúsculas, sem ponto final>
```

- Tipos usados: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `chore`.
- O escopo deve vir da lista em "Escopos válidos" abaixo.
- Exemplos do histórico:
  - `feat(demo): add apex gym landing page and assets`
  - `fix(ui): adjust hero button arrow icon`
- Branches no formato `<tipo>/<descricao-em-kebab-case>` (ex.: `refactor/index-page-cleanup`, `feat/hero-section-mobile`). A branch principal é `main` e só recebe alterações via Pull Request.

### Escopos válidos

Lista mantida atualizada. Sempre que uma alteração introduzir um escopo novo (uma nova seção do site, uma nova demo, uma nova página etc.), **adicione-o aqui como parte da mesma alteração**.

- `demo`
- `ui`
- `perf & ui`
- `html copy`
- `google verification`
- `build` — scripts de build/servidor, `package.json`, `netlify.toml`
- `seo` — metas, Open Graph, `robots.txt`, `sitemap.xml`, 404

## Visão geral

Site estático (HTML + CSS + JS puro, **sem framework**) com a landing page oficial da StargoLab. (`stargolab.com.br`) e landing pages de demonstração por nicho. Publicado no **Netlify**, que roda o build a cada push.

- Público: empresas locais brasileiras. Todo conteúdo visível é em **português do Brasil** (`lang="pt-BR"`).
- Objetivo de cada página: gerar confiança e levar o visitante ao **WhatsApp** (CTA principal).
- Prioridades: performance (mobile first), clareza e conversão.

## Estrutura

```
src/                          # TUDO o que vai ao ar (fonte legível)
  index.html                  # Home da StargoLab.
  404.html                    # Página de erro (caminhos absolutos: é servida em qualquer URL)
  favicon.svg · apple-touch-icon.png · robots.txt · sitemap.xml
  assets/
    css/style.css             # Tokens (:root) + estilos da home
    js/main.js
    fonts/                    # .woff2 auto-hospedadas
    img/                      # og-image.jpg etc.
  demo/<nicho>/               # Cada demo é autocontida (pode virar o site de um cliente)
    index.html
    assets/{css/style.css, js/main.js, img/, fonts/}
templates/demo/               # Molde usado por `npm run new:demo` (não vai ao ar)
scripts/
  build.mjs                   # src/ → dist/ (minifica, versiona, valida)
  serve.mjs                   # Servidor local que imita o Netlify
  new-demo.mjs                # Cria uma demo a partir do molde
dist/                         # Saída do build (ignorada pelo git) — é o que o Netlify publica
netlify.toml                  # Comando de build, pasta publicada, headers e redirects
```

- Demos atuais: `gym` (Apex Gym), `clinic` (Lúmina Odontologia) e `barbershop` (Navalha Barber Club).
- Links e assets locais usam **caminho relativo** (`demo/<nicho>/` na home, `../../` para voltar das demos), para o site funcionar em qualquer raiz: Netlify, `npm run preview` ou Live Server abrindo a `dist/` como subpasta. Links de pasta levam **barra final** (sem ela, o Netlify responde com um redirect 301 extra). A única exceção é a `404.html`, que usa caminhos absolutos porque é servida em qualquer URL.
- Para criar uma demo nova: `npm run new:demo -- <nicho> "<Nome do negócio>"` e depois linkar na seção `#demos` da home.

## Comandos

```bash
npm install        # uma vez (Node 22+, ver .nvmrc)
npm run dev        # serve src/ em http://localhost:3000 (sem build, para editar)
npm run build      # gera dist/ — rode sempre antes de commitar
npm run preview    # build + serve dist/ em http://localhost:4173 (igual à produção)
npm run new:demo -- <nicho> "<Nome>"
```

## Build e validação

O `scripts/build.mjs` copia `src/` para `dist/` e:

1. Minifica CSS (lightningcss — embute `@import` e mantém fallbacks como `vh` antes de `svh`), JS (terser) e HTML (html-minifier-terser). Não existem mais arquivos `.min` no repositório.
2. Acrescenta `?v=<hash do conteúdo>` a todo asset local referenciado no HTML e no CSS e gera `dist/_headers` com cache imutável de 1 ano para as pastas `assets/`. **Não é preciso renomear arquivos ao alterá-los** — o hash muda sozinho.
3. **Falha o build** se encontrar: link/asset local quebrado, `<img>` sem `alt`/`width`/`height`, `target="_blank"` sem `rel="noopener"`, `<use href="#id">` sem símbolo no sprite, caminho local absoluto (`/...`) fora da `404.html`, página sem `lang`, `<title>`, `meta description`, `viewport` ou `theme-color`, ou JSON-LD inválido.

Arquivos CSS cujo nome começa com `_` são parciais: só entram via `@import` e não são publicados.

`<link rel="stylesheet" href="…" data-inline>` faz o build embutir o CSS minificado na página, com os `url()` convertidos para caminhos a partir da raiz. É usado na `404.html`, que é servida em qualquer URL e por isso não pode depender de um caminho para o CSS.

## Convenções de HTML

- HTML semântico: `header`, `main`, `section`, `article`, `footer`, `ol/ul` para listas; sem pular níveis de heading.
- Ícones como **SVG inline** com `aria-hidden="true"`; ícones repetidos vão para um **sprite** (`<symbol>` no topo do `body` + `<use href="#i-nome">`). Links/ícones sem texto recebem `aria-label`.
- Links externos: `target="_blank" rel="noopener noreferrer"`.
- Links de WhatsApp no formato `https://wa.me/55<DDD><número>?text=<mensagem URL-encoded>`. **Nas demos, os links apontam para o WhatsApp da StargoLab** (quem clica é um potencial cliente).
- Toda página deve ter: `meta description`, `meta viewport`, `theme-color`, `<title>` descritivo e Open Graph com `og:image` de 1200×630. Não remova a meta `google-site-verification` da home.
- **Demos:** `<meta name="robots" content="noindex, follow">` (são negócios fictícios e não devem aparecer no Google) e aviso visível em depoimentos, avaliações, casos e registros profissionais ilustrativos. Nunca use números de registro (CRO, CRM etc.) que possam pertencer a uma pessoa real.
- Animações de entrada: classe `reveal` + `delay-1`/`delay-2`/`delay-3`; o JS adiciona `active` via `IntersectionObserver`. O `<head>` tem `<script>document.documentElement.classList.add('js')</script>` e o CSS só esconde `.js .reveal` — **sem JS, o conteúdo aparece normalmente**.
- Imagens: `width`, `height` e `alt` sempre; `loading="lazy" decoding="async"` abaixo da dobra; `fetchpriority="high"` ou `preload` na imagem principal do hero.

## Convenções de CSS

- Cores, fontes e medidas via **custom properties em `:root`**, no topo do `style.css` de cada página (seção `DESIGN TOKENS`). Não use valores de cor soltos quando existir um token.
- Página principal: tema escuro (`--bg: #080808`), fontes Poppins (`--sans`) e JetBrains Mono (`--mono`), largura máxima `--max: 1160px`. Textos devem ter contraste mínimo de 4.5:1 (WCAG AA).
- Nomes de classes em **kebab-case**, estilo BEM-light (`.header-inner`, `.demo-card`, `.card-title`); estados como classes (`.scrolled`, `.active`, `.featured`).
- Seções do CSS separadas por comentários em caixa alta: `/* --- NOME DA SEÇÃO --- */`.
- `.container` com `width: min(calc(100% - var(--gutter)), var(--max))` para gutter responsivo.
- Mobile first, hover só dentro de `@media (hover: hover)` quando fizer diferença no toque, e respeito a `prefers-reduced-motion`.
- Fontes **auto-hospedadas** em `assets/fonts/` (`.woff2`, subset latin, `font-display: swap`), com `preload` apenas da fonte do texto principal. Nada de Google Fonts por CDN.

## Convenções de JavaScript

- JavaScript puro (ES6+), sem bibliotecas.
- Inicialização em `DOMContentLoaded`, com funções `initXxx()` pequenas e com responsabilidade única.
- Sempre verifique se o elemento existe antes de usar (`if (!el) return;`).
- Listeners de scroll com `{ passive: true }` e `requestAnimationFrame` (flag `ticking`).
- Prefira alternar classes a manipular estilos inline.
- Menus mobile: `<button>` com `aria-controls`/`aria-expanded`, fecham com Esc, overlay e clique em link; o painel fechado fica com `visibility: hidden` (fora da ordem de foco).
- Comentários e JSDoc curtos em português.
- Scripts carregados com `defer` no `<head>`.

## Performance e assets

- Imagens em **`.webp`** no tamanho em que são exibidas (no máximo ~2x), com versão mobile **em retrato** para heros de tela cheia (`hero-bg-mobile.webp`) e `preload` do hero.
- Nada de hotlink de imagens (Unsplash etc.): baixe, converta e sirva de `assets/img/`.
- Mantenha as páginas leves: nada de trackers, bibliotecas ou fontes desnecessárias.
- Dependências npm são **só de build** (`devDependencies`). Não adicione dependências de runtime, frameworks ou ferramentas novas sem pedido explícito.

## Testes / verificação

Não há testes automatizados além da validação do build. Para conferir, rode `npm run preview` e verifique em largura mobile (~375px) e desktop, incluindo o menu mobile e a navegação por teclado. O deploy preview do Netlify no PR é a verificação final.

## Textos (copy)

- Tom direto, profissional e orientado a confiança/conversão; frases curtas.
- A marca é escrita **"StargoLab."** (com ponto final) na página principal.
- Revise ortografia em português ao editar textos.
