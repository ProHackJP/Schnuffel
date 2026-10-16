// Hash-Router: funktioniert auf jedem statischen Hosting und offline, ohne Server-Konfiguration.

export const ROUTES = ['/', '/hund', '/training', '/info'];

export function parseHash(hash) {
  let path = String(hash ?? '').replace(/^#/, '').split('?')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return ROUTES.includes(path) ? path : null;
}
