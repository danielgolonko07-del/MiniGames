export type PageRoute = '/' | '/home' | '/library';

const BASE_PATH =
  import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');

export function getCurrentPath(): string {
  const pathname = window.location.pathname;

  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    return pathname.slice(BASE_PATH.length) || '/';
  }

  return pathname;
}

export type AuthRouteMode = 'login' | 'register';

export function navigate(path: PageRoute): void {
  const url = new URL(window.location.href);

  url.pathname = getBrowserPath(path);
  url.search = '';

  window.history.pushState({}, '', url);

  window.dispatchEvent(new Event('app:navigation'));
}

export function openGameRoute(slug: string): void {
  const url = new URL(window.location.href);

  url.searchParams.set('game', slug);

  window.history.pushState(
    {
      gameModal: true,
    },
    '',
    url,
  );

  window.dispatchEvent(new Event('app:dialog-navigation'));
}

export function closeGameRoute(): void {
  const state = window.history.state as {
    gameModal?: boolean;
  } | null;

  /*
   * Jeżeli modal został otwarty
   * normalnie przez aplikację,
   * cofamy historię.
   */
  if (state?.gameModal) {
    window.history.back();

    return;
  }

  /*
   * Jeśli użytkownik wszedł bezpośrednio
   * na URL z ?game=...,
   * nie mamy dokąd się cofnąć.
   */
  const url = new URL(window.location.href);

  url.searchParams.delete('game');

  window.history.replaceState({}, '', url);

  window.dispatchEvent(new Event('app:dialog-navigation'));
}

export function getGameSlugFromUrl(): string | null {
  return new URL(window.location.href).searchParams.get('game');
}

function getBrowserPath(path: PageRoute): string {
  if (path === '/') {
    return `${BASE_PATH}/`;
  }

  return `${BASE_PATH}${path}`;
}
