import { getFeaturedGames } from '../../api/games-api';
import type { Game } from '../../types/game';
import { showSnackbar } from '../snackbar/snackbar';

const AUTOPLAY_TIME = 4000;
const SWIPE_DISTANCE = 50;

const gameImages = import.meta.glob(
  '../../assets/assets/*.{png,jpg,jpeg,webp}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>;

export function createNewGames(
  openGameDetails: (slug: string) => void,
): HTMLElement {
  const section = document.createElement('section');
  section.className = 'new-games';

  const header = document.createElement('div');
  header.className = 'new-games-header';

  const title = document.createElement('h2');
  title.className = 'new-games-title';
  title.textContent = 'New Games';

  const controls = document.createElement('div');
  controls.className = 'new-games-controls';

  const previousButton = createArrowButton(
    '←',
    'Previous game',
    'new-games-button-prev',
  );

  const nextButton = createArrowButton(
    '→',
    'Next game',
    'new-games-button-next',
  );

  controls.append(previousButton, nextButton);

  header.append(title, controls);

  const content = document.createElement('div');
  content.className = 'new-games-content';

  section.append(header, content);

  let previousSlide: (() => void) | undefined;
  let nextSlide: (() => void) | undefined;

  previousButton.addEventListener('click', () => {
    previousSlide?.();
  });

  nextButton.addEventListener('click', () => {
    nextSlide?.();
  });

  async function loadGames(): Promise<void> {
    showLoading();

    try {
      const games = await getFeaturedGames();

      if (!section.isConnected) {
        return;
      }

      if (games.length === 0) {
        showEmpty();
        return;
      }

      const sliderGames = games.slice(0, 9);

      renderSlider(sliderGames);
    } catch {
      if (!section.isConnected) {
        return;
      }

      showError();

      showSnackbar(
        'Failed to load featured games.',
        'error',
      );
    }
  }

  function showLoading(): void {
    previousButton.disabled = true;
    nextButton.disabled = true;

    const skeleton = document.createElement('div');
    skeleton.className = 'slider-skeleton';

    for (let index = 0; index < 5; index += 1) {
      const skeletonCard = document.createElement('div');
      skeletonCard.className = 'slider-skeleton-card';

      skeleton.append(skeletonCard);
    }

    content.replaceChildren(skeleton);
  }

  function showEmpty(): void {
    previousButton.disabled = true;
    nextButton.disabled = true;

    const empty = document.createElement('div');
    empty.className = 'slider-empty';

    const message = document.createElement('p');
    message.textContent = 'No featured games found.';

    empty.append(message);

    content.replaceChildren(empty);
  }

  function showError(): void {
    previousButton.disabled = true;
    nextButton.disabled = true;

    const error = document.createElement('div');
    error.className = 'slider-error';

    const message = document.createElement('p');
    message.textContent =
      'Something went wrong while loading featured games.';

    const retryButton = document.createElement('button');

    retryButton.className = 'slider-retry';
    retryButton.type = 'button';
    retryButton.textContent = 'Retry';

    retryButton.addEventListener('click', () => {
      void loadGames();
    });

    error.append(message, retryButton);

    content.replaceChildren(error);
  }

  function renderSlider(games: Game[]): void {
    previousButton.disabled = false;
    nextButton.disabled = false;

    const viewport = document.createElement('div');
    viewport.className = 'slider-viewport';

    const stage = document.createElement('div');
    stage.className = 'slider-stage';

    viewport.append(stage);

    content.replaceChildren(viewport);

    let activeIndex = 0;

    let autoplayTimer: number | undefined;
    let timerStartedAt = 0;
    let remainingTime = AUTOPLAY_TIME;

    let activePointerId: number | undefined;

    let pointerStartX = 0;
    let pointerMovementX = 0;

    let blockNextClick = false;

    const cards = games.map((game, index) => {
      const card = createGameCard(game);

      card.dataset.index = String(index);

      card.addEventListener('click', () => {
        if (blockNextClick) {
          return;
        }

        openGameDetails(game.slug);
      });

      stage.append(card);

      return card;
    });

    function getCircularDistance(index: number): number {
      let distance = index - activeIndex;

      const half = Math.floor(games.length / 2);

      if (distance > half) {
        distance -= games.length;
      }

      if (distance < -half) {
        distance += games.length;
      }

      return distance;
    }

    function updateCards(): void {
      cards.forEach((card, index) => {
        const distance = getCircularDistance(index);

        card.dataset.slot = String(distance);

        if (distance === 0) {
          card.setAttribute('aria-current', 'true');
        } else {
          card.removeAttribute('aria-current');
        }
      });
    }

    function moveSlider(direction: number): void {
      activeIndex =
        (activeIndex + direction + games.length) %
        games.length;

      updateCards();
    }

    function clearAutoplay(): void {
      if (autoplayTimer !== undefined) {
        window.clearTimeout(autoplayTimer);

        autoplayTimer = undefined;
      }
    }

    function startAutoplay(
      delay: number = remainingTime,
    ): void {
      clearAutoplay();

      remainingTime = delay;
      timerStartedAt = performance.now();

      autoplayTimer = window.setTimeout(() => {
        if (!section.isConnected) {
          return;
        }

        moveSlider(1);

        remainingTime = AUTOPLAY_TIME;

        startAutoplay(AUTOPLAY_TIME);
      }, delay);
    }

    function pauseAutoplay(): void {
      if (autoplayTimer === undefined) {
        return;
      }

      const elapsed =
        performance.now() - timerStartedAt;

      remainingTime = Math.max(
        0,
        remainingTime - elapsed,
      );

      clearAutoplay();
    }

    function resetAutoplay(): void {
      remainingTime = AUTOPLAY_TIME;

      startAutoplay(AUTOPLAY_TIME);
    }

    function movePrevious(): void {
      moveSlider(-1);
      resetAutoplay();
    }

    function moveNext(): void {
      moveSlider(1);
      resetAutoplay();
    }

    previousSlide = movePrevious;
    nextSlide = moveNext;

    viewport.addEventListener(
      'pointerdown',
      (event: PointerEvent) => {

        if (event.button !== 0) {
          return;
        }

        activePointerId = event.pointerId;

        pointerStartX = event.clientX;
        pointerMovementX = 0;

        pauseAutoplay();

        viewport.classList.add('slider-dragging');

        viewport.setPointerCapture(event.pointerId);
      },
    );

    viewport.addEventListener(
      'pointermove',
      (event: PointerEvent) => {
        if (event.pointerId !== activePointerId) {
          return;
        }

        pointerMovementX =
          event.clientX - pointerStartX;

        stage.style.setProperty(
          '--drag-x',
          `${pointerMovementX}px`,
        );
      },
    );

    function finishPointerInteraction(
      event: PointerEvent,
    ): void {
      if (event.pointerId !== activePointerId) {
        return;
      }

      viewport.classList.remove('slider-dragging');

      stage.style.removeProperty('--drag-x');

      const wasSwipe =
        Math.abs(pointerMovementX) >=
        SWIPE_DISTANCE;

      if (wasSwipe) {
        blockNextClick = true;

        if (pointerMovementX < 0) {
          moveSlider(1);
        } else {
          moveSlider(-1);
        }


        resetAutoplay();


        window.setTimeout(() => {
          blockNextClick = false;
        }, 0);
      } else {
        startAutoplay(remainingTime);
      }

      activePointerId = undefined;
      pointerMovementX = 0;
    }

    viewport.addEventListener(
      'pointerup',
      finishPointerInteraction,
    );

    viewport.addEventListener(
      'pointercancel',
      finishPointerInteraction,
    );

    viewport.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });

    updateCards();

    remainingTime = AUTOPLAY_TIME;
    startAutoplay(AUTOPLAY_TIME);
  }

  void loadGames();

  return section;
}

function createArrowButton(
  symbol: string,
  label: string,
  className: string,
): HTMLButtonElement {
  const button = document.createElement('button');

  button.type = 'button';

  button.className =
    `new-games-button ${className}`;

  button.textContent = symbol;

  button.setAttribute('aria-label', label);

  return button;
}

function createGameCard(game: Game): HTMLButtonElement {
  const card = document.createElement('button');

  card.className = 'slider-card';
  card.type = 'button';

  card.setAttribute(
    'aria-label',
    `Open details for ${game.name}`,
  );

  const image = document.createElement('img');

  image.className = 'slider-card-image';

  const imageUrl = getGameImageUrl(game.cardImage);

  if (imageUrl) {
    image.src = imageUrl;
  }

  image.alt = game.name;

  const info = document.createElement('div');
  info.className = 'slider-card-info';

  const title = document.createElement('h3');

  title.className = 'slider-card-title';
  title.textContent = game.name;

  const details = document.createElement('div');

  details.className = 'slider-card-details';

  const rating = document.createElement('span');

  rating.className = 'slider-card-rating';

  rating.textContent = `★ ${game.rating}`;

  const likes = document.createElement('span');

  likes.className = 'slider-card-likes';

  likes.textContent =
    `♡ ${formatLikes(game.likesCount)}`;

  details.append(rating, likes);

  info.append(title, details);

  card.append(image, info);

  return card;
}

function getGameImageUrl(apiPath: string): string {
  if (
    apiPath.startsWith('http://') ||
    apiPath.startsWith('https://')
  ) {
    return apiPath;
  }

  const fileName = apiPath.split('/').pop();

  if (!fileName) {
    return '';
  }

  const asset = Object.entries(gameImages).find(
    ([path]) => path.endsWith(`/${fileName}`),
  );

  return asset?.[1] ?? '';
}

function formatLikes(likes: number): string {
  if (likes < 1000) {
    return String(likes);
  }

  const formattedLikes =
    Math.floor(likes / 100) / 10;

  return `${formattedLikes}K`;
}