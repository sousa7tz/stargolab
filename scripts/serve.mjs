/**
 * Servidor estático mínimo, sem dependências.
 * Imita o comportamento do Netlify: /pasta → /pasta/ (301), /pasta/ → index.html
 * e 404.html para caminhos inexistentes.
 *
 * Uso: node scripts/serve.mjs [pasta] [porta]   (padrão: src 3000)
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'src');
const port = Number(process.argv[3] ?? process.env.PORT ?? 3000);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

/** Retorna o stat do caminho ou null se não existir. */
async function statOrNull(file) {
  try {
    return await stat(file);
  } catch {
    return null;
  }
}

async function send(res, status, file) {
  const body = await readFile(file);
  res.writeHead(status, {
    'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const decoded = decodeURIComponent(pathname);
  const file = path.join(root, decoded);

  // Bloqueia path traversal (../)
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }

  const info = await statOrNull(file);

  if (info?.isDirectory()) {
    if (!decoded.endsWith('/')) {
      res.writeHead(301, { Location: `${pathname}/` }).end();
      return;
    }
    const index = path.join(file, 'index.html');
    if (await statOrNull(index)) return send(res, 200, index);
  } else if (info?.isFile()) {
    return send(res, 200, file);
  }

  const notFound = path.join(root, '404.html');
  if (await statOrNull(notFound)) return send(res, 404, notFound);
  res.writeHead(404).end('404');
});

server.listen(port, () => {
  console.log(`Servindo ${path.relative(process.cwd(), root) || '.'} em http://localhost:${port}`);
});
