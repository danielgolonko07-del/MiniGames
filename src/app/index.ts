import { createHomePage } from '../pages/home-page';

import { createLibraryPage } from '../pages/library-page';

import { createGameDetailsDialog } from '../components/game-details/game-details';

import {
  closeGameRoute,
  getCurrentPath,
  getGameSlugFromUrl,
  navigate,
  openGameRoute,
} from './router';

export function createApp(): HTMLElement {
  const app = document.createElement('div');

  app.id = 'app';

  /*
   * Miejsce na aktualną stronę:
   *
   * Home ALBO Library.
   */
  const pageContainer = document.createElement('main');

  pageContainer.className = 'app-page';

  /*
   * Game Details tworzymy tylko RAZ
   * dla całej aplikacji.
   */
  const gameDetails = createGameDetailsDialog({
    onRequestClose: () => {
      closeGameRoute();
    },
  });

  app.append(pageContainer, gameDetails.element);

  /*
   * TĘ funkcję przekazujemy
   * sliderowi i Library.
   */
  function openGameDetails(slug: string): void {
    openGameRoute(slug);
  }

  /*
   * Render aktualnej strony
   * na podstawie URL.
   */
  function renderPage(): void {
    const path = getCurrentPath();

    if (path === '/' || path === '/home') {
      const homePage = createHomePage(openGameDetails, navigate);

      pageContainer.replaceChildren(homePage);

      return;
    }

    if (path === '/library') {
      const libraryPage = createLibraryPage(openGameDetails, navigate);

      pageContainer.replaceChildren(libraryPage);

      return;
    }

    /*
     * Później tutaj dodamy:
     *
     * createNotFoundPage()
     */
    pageContainer.textContent = '404 - Page Not Found';
  }

  /*
   * Sprawdza parametr ?game=
   * i odpowiednio otwiera/zamyka dialog.
   */
  function syncGameDetails(): void {
    const slug = getGameSlugFromUrl();

    if (slug) {
      gameDetails.open(slug);

      return;
    }

    gameDetails.close();
  }

  /*
   * Synchronizacja całej aplikacji
   * po Back / Forward.
   */
  function syncApp(): void {
    renderPage();

    syncGameDetails();
  }

  window.addEventListener('popstate', syncApp);

  /*
   * Home ↔ Library
   */
  window.addEventListener('app:navigation', syncApp);

  /*
   * Otwieranie Game Details
   * nie musi renderować całej strony.
   */
  window.addEventListener('app:dialog-navigation', syncGameDetails);

  /*
   * Pierwsze uruchomienie.
   */
  syncApp();

  return app;
}
