// Hash-Router: funktioniert auf jedem statischen Hosting und offline, ohne Server-Konfiguration.
// Liefert die erkannte Route als { name, id } oder null.

const STATIC = {
  '/': 'start',
  '/hund': 'hund',
  '/training': 'training',
  '/training/neu': 'training-neu',
  '/herdenschutz': 'herdenschutz',
  '/info': 'info',
};

export function parseHash(hash) {
  let path = String(hash ?? '').replace(/^#/, '').split('?')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (STATIC[path]) return { name: STATIC[path], id: null };
  const match = /^\/training\/([A-Za-z0-9-]{1,64})$/.exec(path);
  if (match) return { name: 'training-edit', id: match[1] };
  return null;
}

// Zu welchem Menüpunkt eine Route gehört.
export function tabFor(route) {
  return route.name === 'start' ? '/' : `/${route.name.split('-')[0]}`;
}
