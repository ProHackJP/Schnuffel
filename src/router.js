// Hash-Router: funktioniert auf jedem statischen Hosting und offline, ohne Server-Konfiguration.
// Liefert die erkannte Route als { name, id } oder null.

const STATIC = {
  '/': 'start',
  '/hund': 'hund',
  '/hund/neu': 'hund-neu',
  '/training': 'training',
  '/training/neu': 'training-neu',
  '/plaene': 'plaene',
  '/plaene/offen': 'plaene-offen',
  '/herdenschutz': 'herdenschutz',
  '/herdenschutz/ausbildung': 'herdenschutz-ausbildung',
  '/info': 'info',
};

export function parseHash(hash) {
  let path = String(hash ?? '').replace(/^#/, '').split('?')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (STATIC[path]) return { name: STATIC[path], id: null };
  const dog = /^\/hund\/([A-Za-z0-9-]{1,64})$/.exec(path);
  if (dog) return { name: 'hund-edit', id: dog[1] };
  const session = /^\/training\/([A-Za-z0-9-]{1,64})$/.exec(path);
  if (session) return { name: 'training-edit', id: session[1] };
  const plan = /^\/plaene\/([a-z0-9-]{1,64})$/.exec(path);
  if (plan) return { name: 'plaene-plan', id: plan[1] };
  return null;
}

// Zu welchem Menüpunkt eine Route gehört.
export function tabFor(route) {
  return route.name === 'start' ? '/' : `/${route.name.split('-')[0]}`;
}
