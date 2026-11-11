const HIDE_NAV_EXACT = new Set(['/login', '/register', '/dev/ui']);

export function shouldHideNav(pathname: string): boolean {
  if (HIDE_NAV_EXACT.has(pathname)) return true;
  if (pathname.startsWith('/add')) return true;
  if (pathname === '/ponds/new' || pathname === '/common/new') return true;
  if (/^\/ponds\/[^/]+$/.test(pathname)) return true;
  if (/^\/dues\/[^/]+$/.test(pathname)) return true;
  if (pathname.startsWith('/settings')) return true;
  if (/\/ponds\/[^/]+\/(edit|start-cycle|close-cycle)$/.test(pathname)) return true;
  return false;
}
