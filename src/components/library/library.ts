import { getCategories, getLibraryGames } from '../../api/games-api';

import type { Game, GameCategory, SortValue } from '../../types/game';

import { getGameImageUrl } from '../../utils/game-image';

import { showSnackbar } from '../snackbar/snackbar';

const PAGE_SIZE = 6;

const DEFAULT_SORT: SortValue = 'rating-desc';

const MOBILE_BREAKPOINT = 375;

interface LibraryState {
  category: string;
  sort: SortValue;
  page: number;
}

interface PaginationState {
  page: number;
  totalPages: number;
}

const SORT_OPTIONS: {
  value: SortValue;
  label: string;
}[] = [
  {
    value: 'rating-desc',
    label: 'Rating ↓',
  },
  {
    value: 'rating-asc',
    label: 'Rating ↑',
  },
  {
    value: 'name-asc',
    label: 'Name A-Z',
  },
  {
    value: 'name-desc',
    label: 'Name Z-A',
  },
];

export function createLibrary(openGameDetails: (slug: string) => void): HTMLElement {
  const section = document.createElement('section');

  section.className = 'library';

  /*
   * HEADER
   */

  const intro = document.createElement('div');

  intro.className = 'library-intro';

  const title = document.createElement('h1');

  title.className = 'library-title';

  title.textContent = 'Game Library';

  const description = document.createElement('p');

  description.className = 'library-description';

  description.textContent = 'Browse our collection of casual mini-games';

  intro.append(title, description);

  /*
   * CONTROLS
   */

  const controls = document.createElement('div');

  controls.className = 'library-controls';

  const categoriesContainer = document.createElement('div');

  categoriesContainer.className = 'library-categories';

  categoriesContainer.setAttribute('aria-label', 'Game categories');

  const sortWrapper = document.createElement('label');

  sortWrapper.className = 'library-sort';

  const sortText = document.createElement('span');

  sortText.textContent = 'Sort by:';

  const sortSelect = document.createElement('select');

  sortSelect.className = 'library-sort-select';

  sortSelect.setAttribute('aria-label', 'Sort games');

  SORT_OPTIONS.forEach((sortOption) => {
    const option = document.createElement('option');

    option.value = sortOption.value;

    option.textContent = sortOption.label;

    sortSelect.append(option);
  });

  sortWrapper.append(sortText, sortSelect);

  controls.append(categoriesContainer, sortWrapper);

  /*
   * GAMES
   */

  const gamesContainer = document.createElement('div');

  gamesContainer.className = 'library-games';

  /*
   * PAGINATION
   */

  const pagination = document.createElement('nav');

  pagination.className = 'library-pagination';

  pagination.setAttribute('aria-label', 'Library pages');

  section.append(intro, controls, gamesContainer, pagination);

  /*
   * STATE
   */

  let categories: GameCategory[] = [];

  let state: LibraryState = {
    category: 'all',
    sort: DEFAULT_SORT,
    page: 1,
  };

  let paginationState: PaginationState = {
    page: 1,
    totalPages: 1,
  };

  let gamesRequest: AbortController | undefined;

  /*
   * INITIAL LOAD
   */

  async function initialize(): Promise<void> {
    showCategoriesLoading();

    showGamesLoading();

    sortSelect.disabled = true;

    try {
      const categoriesResponse = await getCategories();

      categories = categoriesResponse.data;

      const defaultCategory = categories.find((category) => category.isDefault)?.slug ?? 'all';

      state = readStateFromUrl(defaultCategory);

      writeStateToUrl('replace');

      renderCategories();

      sortSelect.value = state.sort;

      sortSelect.disabled = false;

      await loadGames();
    } catch {
      showInitializationError();

      showSnackbar('Failed to load Library data.', 'error');
    }
  }

  /*
   * URL STATE
   */

  function readStateFromUrl(defaultCategory: string): LibraryState {
    const url = new URL(window.location.href);

    const categoryFromUrl = url.searchParams.get('category');

    const categoryExists = categories.some((category) => category.slug === categoryFromUrl);

    const category = categoryFromUrl && categoryExists ? categoryFromUrl : defaultCategory;

    const sortFromUrl = url.searchParams.get('sort');

    const sort = isSortValue(sortFromUrl) ? sortFromUrl : DEFAULT_SORT;

    const pageFromUrl = Number(url.searchParams.get('page'));

    const page = Number.isInteger(pageFromUrl) && pageFromUrl >= 1 ? pageFromUrl : 1;

    return {
      category,
      sort,
      page,
    };
  }

  function writeStateToUrl(mode: 'push' | 'replace'): void {
    const url = new URL(window.location.href);

    url.searchParams.set('category', state.category);

    url.searchParams.set('sort', state.sort);

    url.searchParams.set('page', String(state.page));

    if (mode === 'push') {
      window.history.pushState({}, '', url);

      return;
    }

    window.history.replaceState({}, '', url);
  }

  /*
   * CATEGORIES
   */

  function renderCategories(): void {
    categoriesContainer.replaceChildren();

    categories.forEach((category) => {
      const button = document.createElement('button');

      button.type = 'button';

      button.className = 'library-category';

      button.textContent = category.label;

      button.dataset.category = category.slug;

      button.addEventListener('click', () => {
        if (state.category === category.slug) {
          return;
        }

        state.category = category.slug;

        /*
         * Story 3:
         * zmiana filtra resetuje
         * paginację do page 1.
         */
        state.page = 1;

        updateControls();

        writeStateToUrl('push');

        void loadGames();
      });

      categoriesContainer.append(button);
    });

    updateControls();
  }

  /*
   * SORT
   */

  sortSelect.addEventListener('change', () => {
    if (!isSortValue(sortSelect.value)) {
      return;
    }

    if (state.sort === sortSelect.value) {
      return;
    }

    state.sort = sortSelect.value;

    /*
     * Story 3:
     * zmiana sortowania
     * resetuje page do 1.
     */
    state.page = 1;

    writeStateToUrl('push');

    void loadGames();
  });

  /*
   * UPDATE CONTROLS
   */

  function updateControls(): void {
    const categoryButtons =
      categoriesContainer.querySelectorAll<HTMLButtonElement>('.library-category');

    categoryButtons.forEach((button) => {
      const isActive = button.dataset.category === state.category;

      button.classList.toggle('library-category-active', isActive);

      button.setAttribute('aria-pressed', String(isActive));
    });

    sortSelect.value = state.sort;
  }

  /*
   * FETCH GAMES
   */

  async function loadGames(): Promise<void> {
    gamesRequest?.abort();

    gamesRequest = new AbortController();

    showGamesLoading();

    try {
      const response = await getLibraryGames({
        category: state.category,

        sort: state.sort,

        page: state.page,

        limit: PAGE_SIZE,

        signal: gamesRequest.signal,
      });

      /*
       * Jeżeli request został
       * anulowany, ignorujemy go.
       */
      if (gamesRequest.signal.aborted) {
        return;
      }

      /*
       * EMPTY
       */

      if (response.data.length === 0) {
        /*
         * Dokumentacja wymaga,
         * żeby przy pustych danych
         * widoczna była page 1.
         */
        state.page = 1;

        paginationState = {
          page: 1,
          totalPages: Math.max(1, response.meta.totalPages),
        };

        writeStateToUrl('replace');

        showEmpty();

        renderPagination();

        updateControls();

        return;
      }

      /*
       * SUCCESS
       */

      state.page = response.meta.page;

      paginationState = {
        page: response.meta.page,

        totalPages: Math.max(1, response.meta.totalPages),
      };

      writeStateToUrl('replace');

      renderGames(response.data);

      renderPagination();

      updateControls();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      showGamesError();

      showSnackbar('Failed to load games.', 'error');
    }
  }

  /*
   * GAMES RENDER
   */

  function renderGames(games: Game[]): void {
    gamesContainer.replaceChildren();

    games.forEach((game) => {
      gamesContainer.append(createGameCard(game, categories, openGameDetails));
    });
  }

  /*
   * PAGINATION
   */

  function renderPagination(): void {
    pagination.replaceChildren();

    const { page, totalPages } = paginationState;

    const previousButton = createPaginationButton('‹', 'Previous page');

    previousButton.disabled = page <= 1;

    previousButton.addEventListener('click', () => {
      changePage(page - 1);
    });

    pagination.append(previousButton);

    const pages = getVisiblePages(page, totalPages);

    pages.forEach((pageNumber) => {
      const button = createPaginationButton(String(pageNumber), `Page ${pageNumber}`);

      if (pageNumber === page) {
        button.classList.add('library-page-active');

        button.setAttribute('aria-current', 'page');
      }

      button.addEventListener('click', () => {
        changePage(pageNumber);
      });

      pagination.append(button);
    });

    const nextButton = createPaginationButton('›', 'Next page');

    nextButton.disabled = page >= totalPages;

    nextButton.addEventListener('click', () => {
      changePage(page + 1);
    });

    pagination.append(nextButton);
  }

  function changePage(newPage: number): void {
    if (newPage < 1 || newPage > paginationState.totalPages || newPage === state.page) {
      return;
    }

    state.page = newPage;

    writeStateToUrl('push');

    void loadGames();

    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  /*
   * UI STATES
   */

  function showCategoriesLoading(): void {
    categoriesContainer.replaceChildren();

    for (let index = 0; index < 5; index += 1) {
      const skeleton = document.createElement('span');

      skeleton.className = 'library-category-skeleton';

      categoriesContainer.append(skeleton);
    }
  }

  function showGamesLoading(): void {
    pagination.replaceChildren();

    const skeleton = document.createElement('div');

    skeleton.className = 'library-games-skeleton';

    for (let index = 0; index < PAGE_SIZE; index += 1) {
      const card = document.createElement('div');

      card.className = 'library-card-skeleton';

      skeleton.append(card);
    }

    gamesContainer.replaceChildren(skeleton);
  }

  function showEmpty(): void {
    const empty = document.createElement('div');

    empty.className = 'library-empty';

    const title = document.createElement('h2');

    title.textContent = 'Data Not Found';

    const message = document.createElement('p');

    message.textContent = 'No games match the selected criteria.';

    empty.append(title, message);

    gamesContainer.replaceChildren(empty);
  }

  function showGamesError(): void {
    pagination.replaceChildren();

    const error = document.createElement('div');

    error.className = 'library-error';

    const message = document.createElement('p');

    message.textContent = 'Something went wrong while loading games.';

    const retryButton = document.createElement('button');

    retryButton.type = 'button';

    retryButton.className = 'library-retry';

    retryButton.textContent = 'Retry';

    retryButton.addEventListener('click', () => {
      void loadGames();
    });

    error.append(message, retryButton);

    gamesContainer.replaceChildren(error);
  }

  function showInitializationError(): void {
    sortSelect.disabled = true;

    categoriesContainer.replaceChildren();

    pagination.replaceChildren();

    const error = document.createElement('div');

    error.className = 'library-error';

    const message = document.createElement('p');

    message.textContent = 'Could not load the Library.';

    const retryButton = document.createElement('button');

    retryButton.type = 'button';

    retryButton.className = 'library-retry';

    retryButton.textContent = 'Retry';

    retryButton.addEventListener('click', () => {
      void initialize();
    });

    error.append(message, retryButton);

    gamesContainer.replaceChildren(error);
  }

  void initialize();

  return section;
}

/*
 * GAME CARD
 */

function createGameCard(
  game: Game,
  categories: GameCategory[],
  openGameDetails: (slug: string) => void,
): HTMLElement {
  const article = document.createElement('article');

  article.className = 'library-card';

  /*
   * IMAGE
   */

  const imageWrapper = document.createElement('div');

  imageWrapper.className = 'library-card-image-wrapper';

  const image = document.createElement('img');

  image.className = 'library-card-image';

  const imageUrl = getGameImageUrl(game.cardImage);

  if (imageUrl) {
    image.src = imageUrl;
  }

  image.alt = game.name;

  imageWrapper.append(image);

  /*
   * CONTENT
   */

  const content = document.createElement('div');

  content.className = 'library-card-content';

  const top = document.createElement('div');

  top.className = 'library-card-top';

  const titleWrapper = document.createElement('div');

  titleWrapper.className = 'library-card-title-wrapper';

  const title = document.createElement('h2');

  title.className = 'library-card-title';

  title.textContent = game.name;

  const categoryBadge = document.createElement('span');

  categoryBadge.className = 'library-card-category';

  categoryBadge.textContent = getCategoryLabel(game.category, categories);

  titleWrapper.append(title, categoryBadge);

  const price = document.createElement('span');

  price.className = 'library-card-price';

  price.textContent = game.price;

  if (game.price.toLowerCase() === 'free') {
    price.classList.add('library-card-price-free');
  }

  top.append(titleWrapper, price);

  /*
   * DESCRIPTION
   */

  const description = document.createElement('p');

  description.className = 'library-card-description';

  description.textContent = game.shortDescription;

  /*
   * FOOTER
   */

  const footer = document.createElement('div');

  footer.className = 'library-card-footer';

  const stats = document.createElement('div');

  stats.className = 'library-card-stats';

  const rating = document.createElement('span');

  rating.textContent = `★ ${game.rating}`;

  const likes = document.createElement('span');

  likes.textContent = `♡ ${formatLikes(game.likesCount)}`;

  stats.append(rating, likes);

  const detailsButton = document.createElement('button');

  detailsButton.type = 'button';

  detailsButton.className = 'library-details-button';

  detailsButton.textContent = 'Details';

  detailsButton.setAttribute('aria-label', `Open details for ${game.name}`);

  detailsButton.addEventListener('click', () => {
    openGameDetails(game.slug);
  });

  footer.append(stats, detailsButton);

  content.append(top, description, footer);

  article.append(imageWrapper, content);

  return article;
}

/*
 * PAGINATION HELPERS
 */

function createPaginationButton(text: string, label: string): HTMLButtonElement {
  const button = document.createElement('button');

  button.type = 'button';

  button.className = 'library-page-button';

  button.textContent = text;

  button.setAttribute('aria-label', label);

  return button;
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const limit = window.innerWidth <= MOBILE_BREAKPOINT ? 3 : 4;

  if (totalPages <= limit) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  let start = currentPage - Math.floor((limit - 1) / 2);

  start = Math.max(1, start);

  start = Math.min(start, totalPages - limit + 1);

  return Array.from(
    {
      length: limit,
    },
    (_, index) => start + index,
  );
}

/*
 * OTHER HELPERS
 */

function getCategoryLabel(categorySlug: string, categories: GameCategory[]): string {
  return categories.find((category) => category.slug === categorySlug)?.label ?? categorySlug;
}

function isSortValue(value: string | null): value is SortValue {
  return (
    value === 'rating-desc' ||
    value === 'rating-asc' ||
    value === 'name-asc' ||
    value === 'name-desc'
  );
}

function formatLikes(likes: number): string {
  if (likes < 1000) {
    return String(likes);
  }

  const result = Math.floor(likes / 100) / 10;

  return `${result}K`;
}
