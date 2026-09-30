/**
 * Build do site: src/ → dist/
 *
 * 1. Copia src/ para dist/ (arquivos "_parcial.css" ficam de fora: só entram via @import).
 * 2. Minifica CSS (lightningcss, com @import embutido) e JS (terser).
 * 3. Versiona os assets locais (?v=<hash do conteúdo>) no CSS e no HTML,
 *    o que permite cache imutável de 1 ano (ver _headers gerado no fim).
 * 4. Valida as páginas: links locais quebrados, <img> sem alt/dimensões,
 *    target="_blank" sem rel, metas obrigatórias. Qualquer erro interrompe o build.
 * 5. Minifica o HTML e imprime um relatório de tamanhos.
 */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { bundle } from 'lightningcss';
import { minify as minifyJs } from 'terser';
import { minify as minifyHtml } from 'html-minifier-terser';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// Navegadores-alvo do CSS (lightningcss mantém fallbacks como vh antes de svh)
const version = (major, minor = 0) => (major << 16) | (minor << 8);
const CSS_TARGETS = {
  chrome: version(90),
  edge: version(90),
  firefox: version(90),
  safari: version(14),
  ios_saf: version(14),
  samsung: version(14),
};

const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i; // http:, mailto:, tel:, data:, //, #
const errors = [];

/** Lista recursivamente todos os arquivos de uma pasta. */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }));
  return files.flat();
}

const rel = (file) => path.relative(DIST, file).split(path.sep).join('/');
const hashOf = (content) => createHash('sha256').update(content).digest('hex').slice(0, 10);

/** Retorna o stat do caminho ou null se não existir. */
async function statOrNull(file) {
  try {
    return await stat(file);
  } catch {
    return null;
  }
}

/**
 * Resolve uma referência local (relativa ao arquivo ou absoluta a partir da raiz).
 * Retorna { file, info } ou null se for externa.
 */
async function resolveLocal(ref, fromFile) {
  if (!ref || EXTERNAL.test(ref)) return null;
  const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
  const base = clean.startsWith('/') ? DIST : path.dirname(fromFile);
  const file = path.join(base, clean);
  return { file, info: await statOrNull(file) };
}

// Hash do conteúdo final de cada arquivo em dist/ (preenchido ao longo do build)
const hashes = new Map();

async function hashFile(file) {
  if (!hashes.has(file)) hashes.set(file, hashOf(await readFile(file)));
  return hashes.get(file);
}

/** Acrescenta ?v=<hash> a uma referência local existente; registra erro se estiver quebrada. */
async function versionRef(ref, fromFile) {
  const resolved = await resolveLocal(ref, fromFile);
  if (!resolved) return ref;

  const { file, info } = resolved;
  if (info?.isDirectory()) {
    if (!(await statOrNull(path.join(file, 'index.html')))) {
      errors.push(`${rel(fromFile)}: link para pasta sem index.html → ${ref}`);
    }
    return ref;
  }
  if (!info) {
    errors.push(`${rel(fromFile)}: referência quebrada → ${ref}`);
    return ref;
  }
  if (file.endsWith('.html') || ref.includes('?')) return ref;

  const [pathPart, fragment] = ref.split('#');
  return `${pathPart}?v=${await hashFile(file)}${fragment ? `#${fragment}` : ''}`;
}

/** Substitui cada match de uma regex por um valor assíncrono. */
async function replaceAsync(input, regex, replacer) {
  const parts = [];
  let last = 0;
  for (const match of input.matchAll(regex)) {
    parts.push(input.slice(last, match.index), await replacer(...match));
    last = match.index + match[0].length;
  }
  parts.push(input.slice(last));
  return parts.join('');
}

// --- CSS ---
async function buildCss(file) {
  const source = path.join(SRC, path.relative(DIST, file));
  const { code, warnings } = bundle({
    filename: source,
    minify: true,
    targets: CSS_TARGETS,
  });
  warnings.forEach((w) => console.warn(`  aviso CSS ${rel(file)}: ${w.message}`));

  const css = await replaceAsync(
    code.toString(),
    /url\((["']?)([^"')]+)\1\)/g,
    async (_, quote, ref) => `url(${quote}${await versionRef(ref, file)}${quote})`,
  );
  await writeFile(file, css);
}

// --- JS ---
async function buildJs(file) {
  const { code } = await minifyJs(await readFile(file, 'utf8'), {
    ecma: 2020,
    compress: { passes: 2 },
    mangle: true,
    format: { comments: false },
  });
  await writeFile(file, code);
}

// --- HTML ---
/** Confere as convenções do projeto em uma página (antes de minificar). */
function lintHtml(html, file) {
  const where = rel(file);
  const fail = (msg) => errors.push(`${where}: ${msg}`);

  if (!/<html[^>]*\slang="[^"]+"/.test(html)) fail('<html> sem atributo lang');
  if (!/<title>[^<]+<\/title>/.test(html)) fail('<title> ausente ou vazio');
  if (!/<meta\s+name="description"\s+content="[^"]+"/.test(html)) fail('meta description ausente');
  if (!/<meta\s+name="viewport"/.test(html)) fail('meta viewport ausente');
  if (!/<meta\s+name="theme-color"/.test(html)) fail('meta theme-color ausente');

  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    for (const attr of ['alt', 'width', 'height']) {
      if (!new RegExp(`\\s${attr}=`).test(tag)) fail(`<img> sem ${attr}: ${tag.slice(0, 80)}…`);
    }
  }

  for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(tag)) fail(`link com target="_blank" sem rel="noopener": ${tag.slice(0, 80)}…`);
  }

  // <use href="#id"> precisa apontar para um <symbol> existente
  for (const [, id] of html.matchAll(/<use\b[^>]*href="#([^"]+)"/g)) {
    if (!html.includes(`id="${id}"`)) fail(`ícone #${id} não existe no sprite`);
  }
}

async function buildHtml(file) {
  // Comentários saem antes de tudo (não são validados nem publicados)
  let html = (await readFile(file, 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
  lintHtml(html, file);

  // Versiona assets referenciados em href/src
  html = await replaceAsync(
    html,
    /(\s(?:href|src))="([^"]+)"/g,
    async (_, attr, ref) => `${attr}="${await versionRef(ref, file)}"`,
  );

  // JSON-LD: valida e compacta
  html = html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
    (match, open, json, close) => {
      try {
        return open + JSON.stringify(JSON.parse(json)) + close;
      } catch (err) {
        errors.push(`${rel(file)}: JSON-LD inválido (${err.message})`);
        return match;
      }
    },
  );

  html = await minifyHtml(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    collapseBooleanAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,
  });
  await writeFile(file, html);
}

// --- CABEÇALHOS DE CACHE (Netlify _headers) ---
/** Toda pasta "assets" recebe cache imutável: os arquivos são sempre referenciados com ?v=hash. */
async function writeHeaders(files) {
  const assetDirs = new Set();
  for (const file of files) {
    const parts = rel(file).split('/');
    const index = parts.indexOf('assets');
    if (index !== -1) assetDirs.add(`/${parts.slice(0, index + 1).join('/')}/*`);
  }

  const rules = [...assetDirs].sort().map((dir) => `${dir}\n  Cache-Control: public, max-age=31536000, immutable`);
  await writeFile(path.join(DIST, '_headers'), `# Gerado por scripts/build.mjs — não editar\n${rules.join('\n\n')}\n`);
}

// --- RELATÓRIO ---
async function report(files) {
  const rows = [];
  for (const file of files.filter((f) => /\.(html|css|js)$/.test(f))) {
    const source = await readFile(path.join(SRC, path.relative(DIST, file)));
    const built = await readFile(file);
    rows.push([rel(file), source.length, built.length, gzipSync(built).length]);
  }

  const kb = (n) => `${(n / 1024).toFixed(1)} kB`.padStart(9);
  const width = Math.max(...rows.map(([name]) => name.length));
  console.log(`\n${'arquivo'.padEnd(width)}      fonte   minific.       gzip`);
  for (const [name, source, built, gz] of rows) {
    console.log(`${name.padEnd(width)}  ${kb(source)}  ${kb(built)}  ${kb(gz)}`);
  }
}

// --- EXECUÇÃO ---
const start = performance.now();

// Esvazia dist/ sem remover a pasta em si (no Windows, a pasta pode estar em uso por um terminal ou pelo preview)
await mkdir(DIST, { recursive: true });
await Promise.all((await readdir(DIST)).map((name) => rm(path.join(DIST, name), { recursive: true, force: true })));
await cp(SRC, DIST, {
  recursive: true,
  filter: (source) => !path.basename(source).startsWith('_'),
});

const files = await walk(DIST);
const byExt = (ext) => files.filter((f) => f.endsWith(ext));

// Ordem importa: CSS/JS antes do HTML, para o hash refletir o conteúdo final
await Promise.all(byExt('.js').map(buildJs));
await Promise.all(byExt('.css').map(buildCss));
await Promise.all(byExt('.html').map(buildHtml));
await writeHeaders(files);

if (errors.length) {
  console.error(`\n✖ Build falhou com ${errors.length} erro(s):\n`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

await report(files);
console.log(`\n✔ Build concluído em ${Math.round(performance.now() - start)} ms → dist/`);
