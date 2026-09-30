# CLAUDE.md

Guia de padronização do projeto **StargoLab.** para assistentes de IA (Claude Code e similares).

## Fluxo obrigatório de contribuição (checklist)

Vale para **toda** alteração, inclusive as pequenas (correção de texto, ajuste de cor etc.):

1. **Verificar o estado:** rodar `git status` e `git branch` para confirmar a branch atual e se há alterações não commitadas pendentes. Se houver pendências, avisar o usuário antes de continuar.
2. **Criar branch:** sair da `main` para uma branch nova no padrão `<tipo>/<descricao-em-kebab-case>` (ex.: `feat/hero-section-mobile`). Nunca editar direto na `main`.
3. **Editar os arquivos fonte** (`style.css`, `main.js`, `script.js`, HTML), nunca apenas os `.min`.
4. **Regenerar os `.min`** correspondentes (ver "Fluxo de edição").
5. **Atualizar os escopos:** se a alteração introduzir um escopo novo, adicioná-lo à lista em "Escopos válidos" neste arquivo.
6. **Sugerir o commit:** listar os arquivos alterados e propor a mensagem no padrão Conventional Commits.
7. **Aguardar confirmação:** perguntar se deve prosseguir com `git add` e `git commit`. Só executar com confirmação explícita do usuário.
8. **Instruir a abertura de PR** para a `main`. Nunca fazer merge automático.

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

## Visão geral

Site estático (HTML + CSS + JS puro, **sem framework, sem bundler, sem `package.json`**) com a landing page oficial da StargoLab. (`stargolab.com.br`) e landing pages de demonstração por nicho.

- Público: empresas locais brasileiras. Todo conteúdo visível é em **português do Brasil** (`lang="pt-BR"`).
- Objetivo de cada página: gerar confiança e levar o visitante ao **WhatsApp** (CTA principal).
- Prioridades: performance (mobile first), clareza e conversão.

## Estrutura

```
index.html                  # Landing page principal (HTML minificado em uma linha)
src/assets/css/variables.css  # Design tokens (:root) da página principal
src/assets/css/style.css      # Fonte legível do CSS (importa variables.css)
src/assets/css/style.min.css  # Versão minificada — é a que o index.html carrega
src/assets/js/main.js         # Fonte legível do JS
src/assets/js/main.min.js     # Versão minificada — é a que o index.html carrega
demo/<nicho>/               # Cada demo é autocontida (html, css, js, assets próprios)
  demo/gym/                 # Apex Gym (usa style.min.css / script.min.js + assets/ locais)
  demo/clinic/              # Lúmina Odontologia (usa css/style.css e js/main.js direto)
public/                     # Reservado para arquivos públicos (og-image etc.)
```

- A home linka para `/demo/gym`, `/demo/clinic` e `/demo/barber` (caminhos absolutos a partir da raiz do domínio). **`demo/barber` ainda não existe** — ao criar novas demos, siga o padrão `demo/<nicho>/index.html`.

## Fluxo de edição

1. **Edite sempre os arquivos fonte** (`style.css`, `main.js`, `script.js`), nunca apenas o `.min`.
2. Depois, **regenere o `.min` correspondente** para manter os dois em sincronia (não há script de build; use um minificador externo, ex. `npx terser`/`npx csso`, e avise o usuário se não conseguir gerar).
3. O `index.html` da raiz está minificado. Ao editá-lo, preserve o estilo compacto (atributos sem aspas quando possível, sem quebras de linha) ou pergunte ao usuário antes de reformatar.
4. Não adicione dependências, frameworks ou ferramentas de build sem pedido explícito.

## Convenções de HTML

- HTML semântico: `header`, `main`, `section`, `article`, `footer`, `ol/ul` para listas.
- Ícones como **SVG inline** com `aria-hidden="true"`; links/ícones sem texto recebem `aria-label`.
- Links externos: `target="_blank" rel="noopener noreferrer"`.
- Links de WhatsApp no formato `https://wa.me/55<DDD><número>?text=<mensagem URL-encoded>`.
- Toda página deve ter: `meta description`, `meta viewport`, `theme-color`, `<title>` descritivo; na home também Open Graph/Twitter Cards. Não remova a meta `google-site-verification`.
- Animações de entrada: classe `reveal` + `delay-1`/`delay-2`/`delay-3`; o JS adiciona `active` via `IntersectionObserver`.

## Convenções de CSS

- Cores, fontes e medidas via **custom properties em `:root`** (`var(--...)`). Não use valores de cor soltos quando existir um token.
- Página principal: tema escuro (`--bg: #080808`), fontes Poppins (`--sans`) e JetBrains Mono (`--mono`), largura máxima `--max: 1160px`.
- Nomes de classes em **kebab-case**, estilo BEM-light (`.header-inner`, `.demo-card`, `.card-title`); estados como classes (`.scrolled`, `.active`, `.featured`).
- Seções do CSS separadas por comentários em caixa alta: `/* --- NOME DA SEÇÃO --- */`.
- `.container` com `width: min(calc(100% - 32px), var(--max))` para gutter responsivo.
- Mobile first e respeito a `prefers-reduced-motion` em animações.
- Fontes: Google Fonts com `display=swap` e carregamento não bloqueante, ou fontes locais `.woff2` (como em `demo/gym/assets/fonts`).

## Convenções de JavaScript

- JavaScript puro (ES6+), sem bibliotecas.
- Inicialização em `DOMContentLoaded`, com funções `initXxx()` pequenas e com responsabilidade única.
- Sempre verifique se o elemento existe antes de usar (`if (!el) return;`).
- Listeners de scroll com `{ passive: true }` e `requestAnimationFrame` (flag `ticking`).
- Prefira alternar classes a manipular estilos inline.
- Comentários e JSDoc curtos em português.
- Scripts carregados com `defer`.

## Performance e assets

- Imagens em **`.webp`**, com versão mobile quando for imagem de destaque (`hero-bg-mobile.webp`) e `preload` do hero.
- CSS crítico inline + CSS principal carregado de forma assíncrona é aceitável em demos (padrão do `demo/gym`).
- Mantenha as páginas leves: nada de trackers, bibliotecas ou fontes desnecessárias.

## Testes / verificação

Não há testes automatizados. Para validar, abra os arquivos localmente com um servidor estático a partir da raiz (ex.: `npx serve .` ou `python -m http.server`), já que os links das demos são absolutos (`/demo/...`). Verifique em largura mobile (~375px) e desktop.

## Textos (copy)

- Tom direto, profissional e orientado a confiança/conversão; frases curtas.
- A marca é escrita **"StargoLab."** (com ponto final) na página principal.
- Revise ortografia em português ao editar textos.
