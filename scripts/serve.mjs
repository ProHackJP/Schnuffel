// Kleiner statischer Webserver ohne Abhängigkeiten, für Entwicklung und Tests.
// Aufruf: node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.argv[2] ?? process.env.PORT ?? 8080);

// Nur diese Pfade werden ausgeliefert, damit z. B. node_modules oder .git nicht erreichbar sind.
const allowed = [/^\/$/, /^\/index\.html$/, /^\/manifest\.webmanifest$/, /^\/sw\.js$/, /^\/src\//, /^\/icons\//];

// Wendet die Regeln aus _headers an (nur '/*' und exakte Pfade), damit Tests unter denselben Headern laufen wie das Hosting.
const headerRules = parseHeaders(await readFile(join(root, '_headers'), 'utf8'));

function parseHeaders(text) {
  const rules = [];
  for (const line of text.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) rules.push({ path: line.trim(), headers: {} });
    else {
      const [name, ...rest] = line.trim().split(':');
      rules.at(-1).headers[name.trim()] = rest.join(':').trim();
    }
  }
  return rules;
}

function headersFor(path) {
  const result = {};
  for (const rule of headerRules) {
    if (rule.path === '/*' || rule.path === path) Object.assign(result, rule.headers);
  }
  return result;
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let path = normalize(decodeURIComponent(url.pathname));
  if (!allowed.some((re) => re.test(path)) || path.includes('..')) {
    res.writeHead(404).end('Nicht gefunden');
    return;
  }
  if (path === '/') path = '/index.html';
  const file = join(root, path);
  try {
    if (!(await stat(file)).isFile()) throw new Error('kein File');
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
      ...headersFor(path),
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('Nicht gefunden');
  }
}).listen(port, () => {
  console.log(`Schnuffel läuft auf http://localhost:${port}`);
});
