import { ApiError, getGameComments, getGameDetails } from '../../api/game-details-api';

import type { GameComment, GameDetails, GameRecord } from '../../types/game-details';

import { getGameImageUrl } from '../../utils/game-image';

import { showSnackbar } from '../snackbar/snackbar';

const CLOSE_ANIMATION_TIME = 180;

const MAX_TEXTAREA_HEIGHT = 88;

interface GameDetailsDialogOptions {
  onRequestClose: () => void;
}

export interface GameDetailsDialog {
  element: HTMLDialogElement;

  open: (slug: string) => void;

  close: () => void;
}

export function createGameDetailsDialog(options: GameDetailsDialogOptions): GameDetailsDialog {
  const dialog = document.createElement('dialog');

  dialog.className = 'game-details-dialog';

  const panel = document.createElement('div');

  panel.className = 'game-details-panel';

  dialog.append(panel);

  let currentSlug: string | undefined;

  let detailsRequest: AbortController | undefined;

  let commentsRequest: AbortController | undefined;

  let closeTimer: number | undefined;

  /*
   * ESC
   */

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();

    options.onRequestClose();
  });

  /*
   * BACKDROP
   */

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      options.onRequestClose();
    }
  });

  function open(slug: string): void {
    if (closeTimer !== undefined) {
      window.clearTimeout(closeTimer);

      closeTimer = undefined;
    }

    dialog.classList.remove('game-details-closing');

    const sameGame = currentSlug === slug;

    currentSlug = slug;

    if (!dialog.open) {
      dialog.showModal();

      document.body.classList.add('modal-open');
    }

    if (sameGame) {
      return;
    }

    abortRequests();

    resetContent();

    renderLoading();

    void loadGame(slug);
  }

  function close(): void {
    if (!dialog.open) {
      return;
    }

    abortRequests();

    dialog.classList.add('game-details-closing');

    closeTimer = window.setTimeout(() => {
      dialog.close();

      dialog.classList.remove('game-details-closing');

      document.body.classList.remove('modal-open');

      currentSlug = undefined;

      resetContent();

      closeTimer = undefined;
    }, CLOSE_ANIMATION_TIME);
  }

  async function loadGame(slug: string): Promise<void> {
    detailsRequest = new AbortController();

    try {
      const game = await getGameDetails(slug, {
        signal: detailsRequest.signal,
      });

      if (currentSlug !== slug) {
        return;
      }

      const commentsUi = renderGame(game);

      void loadComments(slug, commentsUi);
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        renderNotFound();

        return;
      }

      renderGameError(slug);

      showSnackbar('Failed to load game details.', 'error');
    }
  }

  interface CommentsUi {
    heading: HTMLHeadingElement;

    content: HTMLDivElement;
  }

  async function loadComments(slug: string, ui: CommentsUi): Promise<void> {
    commentsRequest = new AbortController();

    renderCommentsLoading(ui.content);

    try {
      const result = await getGameComments(slug, commentsRequest.signal);

      if (currentSlug !== slug) {
        return;
      }

      ui.heading.textContent = `Comments (${result.totalItems})`;

      if (result.comments.length === 0) {
        renderCommentsEmpty(ui.content);

        return;
      }

      renderComments(ui.content, result.comments);
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      renderCommentsError(ui.content, () => {
        void loadComments(slug, ui);
      });

      showSnackbar('Failed to load comments.', 'error');
    }
  }

  function renderLoading(): void {
    const closeButton = createCloseButton();

    const skeleton = document.createElement('div');

    skeleton.className = 'game-details-skeleton';

    skeleton.innerHTML = `
      <div class="game-details-skeleton-hero"></div>

      <div class="game-details-skeleton-content">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    `;

    panel.append(closeButton, skeleton);
  }

  function renderNotFound(): void {
    resetContent();

    const closeButton = createCloseButton();

    const state = document.createElement('div');

    state.className = 'game-details-state';

    const title = document.createElement('h2');

    title.textContent = 'Game Not Found';

    const message = document.createElement('p');

    message.textContent = 'The requested game could not be found.';

    state.append(title, message);

    panel.append(closeButton, state);
  }

  function renderGameError(slug: string): void {
    resetContent();

    const closeButton = createCloseButton();

    const state = document.createElement('div');

    state.className = 'game-details-state';

    const message = document.createElement('p');

    message.textContent = 'Something went wrong while loading the game.';

    const retry = document.createElement('button');

    retry.type = 'button';

    retry.className = 'game-details-retry';

    retry.textContent = 'Retry';

    retry.addEventListener('click', () => {
      resetContent();

      renderLoading();

      void loadGame(slug);
    });
    state.append(message, retry);

    panel.append(closeButton, state);
  }

  function renderGame(game: GameDetails): CommentsUi {
    resetContent();

    /*
     * HERO
     */

    const hero = document.createElement('div');

    hero.className = 'game-details-hero';

    const heroImage = document.createElement('img');

    heroImage.className = 'game-details-hero-image';

    heroImage.src = getGameImageUrl(game.heroImage);

    heroImage.alt = game.name;

    const closeButton = createCloseButton();

    hero.append(heroImage, closeButton);

    /*
     * MAIN CONTENT
     */

    const body = document.createElement('div');

    body.className = 'game-details-body';

    const titleRow = document.createElement('div');

    titleRow.className = 'game-details-title-row';

    const title = document.createElement('h2');

    title.className = 'game-details-title';

    title.textContent = game.name;

    const stats = document.createElement('div');

    stats.className = 'game-details-rating';

    const rating = document.createElement('span');

    rating.textContent = `★ ${game.rating}`;

    const likes = document.createElement('span');

    likes.textContent = `♡ ${formatLikes(game.likesCount)}`;

    stats.append(rating, likes);

    titleRow.append(title, stats);

    const description = document.createElement('p');

    description.className = 'game-details-description';

    description.textContent = game.description;

    /*
     * BADGES
     */

    const badges = document.createElement('div');

    badges.className = 'game-details-badges';

    badges.append(
      createInfoBadge('Genre', capitalize(game.category)),

      createInfoBadge('Players', game.players),

      createInfoBadge('Duration', game.duration),

      createInfoBadge('Price', game.price),
    );

    /*
     * ACTIONS
     */

    const actions = document.createElement('div');

    actions.className = 'game-details-actions';

    const primary = document.createElement('button');

    primary.type = 'button';

    primary.className = 'game-details-primary';

    const free = game.price.trim().toLowerCase() === 'free';

    primary.textContent = free ? 'Play Now' : `Buy Now: ${game.price}`;

    /*
     * Story 2 / Story 3:
     * Play / Buy nie wykonuje
     * jeszcze realnej akcji.
     */

    const favorite = document.createElement('button');

    favorite.type = 'button';

    favorite.className = 'game-details-favorite';

    let favoriteActive = game.isLikedByCurrentUser;

    function updateFavorite(): void {
      favorite.classList.toggle('game-details-favorite-active', favoriteActive);

      favorite.setAttribute('aria-pressed', String(favoriteActive));

      favorite.innerHTML = `<span aria-hidden="true">♡</span>
         <span class="game-details-favorite-text">
           ${favoriteActive ? 'Added to Favorites' : 'Add to Favorites'}
         </span>`;
    }

    favorite.addEventListener('click', () => {
      /*
       * Tymczasowy UI state
       * zgodny ze Story 2.
       *
       * W Story 4 zamienisz
       * to na request API.
       */
      favoriteActive = !favoriteActive;

      updateFavorite();
    });

    updateFavorite();

    actions.append(primary, favorite);

    /*
     * TOP RECORDS
     */

    const records = createTopRecords(game.topRecords);

    /*
     * COMMENTS
     */

    const comments = document.createElement('section');

    comments.className = 'game-comments';

    const commentsHeading = document.createElement('h3');

    commentsHeading.className = 'game-comments-title';

    commentsHeading.textContent = 'Comments';

    const commentForm = createCommentForm();

    const commentsContent = document.createElement('div');

    commentsContent.className = 'game-comments-content';

    comments.append(commentsHeading, commentForm, commentsContent);

    body.append(titleRow, description, badges, actions, records, comments);

    panel.append(hero, body);

    return {
      heading: commentsHeading,

      content: commentsContent,
    };
  }

  function createCloseButton(): HTMLButtonElement {
    const button = document.createElement('button');

    button.type = 'button';

    button.className = 'game-details-close';

    button.textContent = '×';

    button.setAttribute('aria-label', 'Close game details');

    button.addEventListener('click', options.onRequestClose);

    return button;
  }

  function resetContent(): void {
    panel.replaceChildren();
  }

  function abortRequests(): void {
    detailsRequest?.abort();

    commentsRequest?.abort();

    detailsRequest = undefined;

    commentsRequest = undefined;
  }

  return {
    element: dialog,
    open,
    close,
  };
}

/*
 * INFO BADGE
 */

function createInfoBadge(label: string, value: string): HTMLElement {
  const badge = document.createElement('div');

  badge.className = 'game-details-badge';

  const labelElement = document.createElement('span');

  labelElement.className = 'game-details-badge-label';

  labelElement.textContent = label;

  const valueElement = document.createElement('strong');

  valueElement.textContent = value;

  badge.append(labelElement, valueElement);

  return badge;
}

/*
 * RECORDS
 */

function createTopRecords(records: GameRecord[]): HTMLElement {
  const section = document.createElement('section');

  section.className = 'game-records';

  const title = document.createElement('h3');

  title.textContent = '🏆 Top Records';

  section.append(title);

  if (records.length === 0) {
    const empty = document.createElement('p');

    empty.textContent = 'No records yet.';

    section.append(empty);

    return section;
  }

  const list = document.createElement('div');

  list.className = 'game-records-list';

  records.forEach((record, index) => {
    const row = document.createElement('div');

    row.className = 'game-record';

    const medal = document.createElement('span');

    medal.textContent = getMedal(index);

    const name = document.createElement('strong');

    name.textContent = record.playerName;

    const score = document.createElement('strong');

    score.textContent = `${formatScore(record.score)} pts`;

    row.append(medal, name, score);

    if (record.createdAt) {
      const time = document.createElement('span');

      time.className = 'game-record-time';

      time.textContent = formatRelativeTime(record.createdAt);

      row.append(time);
    }

    list.append(row);
  });

  section.append(list);

  return section;
}

/*
 * COMMENT FORM
 */

function createCommentForm(): HTMLFormElement {
  const form = document.createElement('form');

  form.className = 'game-comment-form';

  const avatar = document.createElement('span');

  avatar.className = 'game-comment-form-avatar';

  avatar.textContent = 'U';

  const textarea = document.createElement('textarea');

  textarea.className = 'game-comment-input';

  textarea.placeholder = 'Write a comment...';

  textarea.rows = 1;

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';

    const height = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);

    textarea.style.height = `${height}px`;

    textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  });

  const submit = document.createElement('button');

  submit.type = 'submit';

  submit.className = 'game-comment-submit';

  submit.textContent = '➤';

  submit.setAttribute('aria-label', 'Submit comment');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    /*
     * Story 4:
     * tutaj dojdzie POST
     * komentarza.
     */
  });

  form.append(avatar, textarea, submit);

  return form;
}

/*
 * COMMENTS STATES
 */

function renderCommentsLoading(container: HTMLElement): void {
  const skeleton = document.createElement('div');

  skeleton.className = 'comments-skeleton';

  for (let index = 0; index < 3; index += 1) {
    const item = document.createElement('div');

    item.className = 'comments-skeleton-item';

    skeleton.append(item);
  }

  container.replaceChildren(skeleton);
}

function renderCommentsEmpty(container: HTMLElement): void {
  const empty = document.createElement('p');

  empty.className = 'game-comments-empty';

  empty.textContent = 'No comments yet.';

  container.replaceChildren(empty);
}

function renderCommentsError(container: HTMLElement, retry: () => void): void {
  const state = document.createElement('div');

  state.className = 'game-comments-error';

  const message = document.createElement('p');

  message.textContent = 'Failed to load comments.';

  const button = document.createElement('button');

  button.type = 'button';

  button.textContent = 'Retry';

  button.addEventListener('click', retry);

  state.append(message, button);

  container.replaceChildren(state);
}

function renderComments(container: HTMLElement, comments: GameComment[]): void {
  container.replaceChildren();

  comments.forEach((comment) => {
    container.append(createComment(comment));
  });
}

function createComment(comment: GameComment): HTMLElement {
  const article = document.createElement('article');

  article.className = 'game-comment';

  const header = document.createElement('div');

  header.className = 'game-comment-header';

  const avatar = document.createElement('span');

  avatar.className = 'game-comment-avatar';

  avatar.textContent = getInitial(comment.authorName);

  const author = document.createElement('strong');

  author.textContent = comment.authorName;

  const time = document.createElement('span');

  time.className = 'game-comment-time';

  time.textContent = formatRelativeTime(comment.createdAt);

  header.append(avatar, author, time);

  const text = document.createElement('p');

  text.className = 'game-comment-text';

  text.textContent = comment.text;

  const like = document.createElement('button');

  like.type = 'button';

  like.className = 'game-comment-like';

  let liked = false;

  function updateLike(): void {
    like.classList.toggle('game-comment-like-active', liked);

    like.setAttribute('aria-pressed', String(liked));

    like.textContent = `♡ ${comment.likesCount}`;
  }

  like.addEventListener('click', () => {
    /*
     * Story 2:
     * lokalny transient state.
     *
     * Story 4:
     * dojdzie API mutation.
     */
    liked = !liked;

    updateLike();
  });

  updateLike();

  article.append(header, text, like);

  return article;
}

/*
 * HELPERS
 */

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return '';
  }

  const milliseconds = Math.max(0, Date.now() - timestamp.getTime());

  const minutes = Math.floor(milliseconds / 60_000);

  if (minutes < 1) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks <= 3) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  const years = Math.max(1, Math.floor(days / 365));

  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

function formatLikes(likes: number): string {
  if (likes < 1000) {
    return String(likes);
  }

  return `${Math.floor(likes / 100) / 10}K`;
}

function formatScore(score: number): string {
  return new Intl.NumberFormat('en-US').format(score);
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function getMedal(index: number): string {
  const medals = ['🥇', '🥈', '🥉'];

  return medals[index] ?? '🏅';
}

function capitalize(value: string): string {
  if (!value) {
    return '';
  }

  return value[0].toUpperCase() + value.slice(1);
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
