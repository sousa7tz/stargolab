/**
 * Cria uma demo nova a partir de templates/demo.
 *
 * Uso: npm run new:demo -- <nicho> "<Nome do negócio>"
 * Ex.: npm run new:demo -- restaurant "Casa Brasa"
 */
import { cp, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TEMPLATE = path.join(ROOT, 'templates', 'demo');
const WHATSAPP_NUMBER = '5511990067946';

const [slug, name] = process.argv.slice(2);

if (!slug || !name) {
  console.error('Uso: npm run new:demo -- <nicho> "<Nome do negócio>"');
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(`Nicho inválido: "${slug}". Use kebab-case sem acentos (ex.: pet-shop).`);
  process.exit(1);
}

const target = path.join(ROOT, 'src', 'demo', slug);
if (await stat(target).catch(() => null)) {
  console.error(`Já existe uma demo em src/demo/${slug}.`);
  process.exit(1);
}

const message = `Olá! Vim pela demonstração ${name} e quero saber mais.`;
const replacements = {
  '{{NOME}}': name,
  '{{SLUG}}': slug,
  '{{INICIAL}}': name.trim().charAt(0).toUpperCase(),
  '{{WHATSAPP}}': `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
};

await cp(TEMPLATE, target, { recursive: true });

/** Substitui os marcadores {{...}} em todos os arquivos de texto copiados. */
async function fill(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await fill(file);
    } else if (/\.(html|css|js|svg)$/.test(entry.name)) {
      let content = await readFile(file, 'utf8');
      for (const [key, value] of Object.entries(replacements)) content = content.replaceAll(key, value);
      await writeFile(file, content);
    }
  }
}

await fill(target);

console.log(`✔ Demo criada em src/demo/${slug}/

Próximos passos:
  1. Ajuste tokens (cores/fontes) em assets/css/style.css e os textos do index.html.
  2. Adicione imagens .webp em assets/img/ (hero com versão mobile + preload) e a og-image.jpg (1200x630).
  3. Linke a demo na home (src/index.html, seção #demos) com caminho relativo e barra final: demo/${slug}/
  4. Adicione o escopo "demo" no commit e rode "npm run build" para validar.`);
