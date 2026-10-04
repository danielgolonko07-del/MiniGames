import { getLeaderboard } from '../../api/leaderboard-api';

import type { LeaderboardPlayer } from '../../types/leaderboard';

import { showSnackbar } from '../snackbar/snackbar';

export function createLeaderboard(): HTMLElement {
  const section = document.createElement('section');

  section.className = 'leaderboard';

  const title = document.createElement('h2');

  title.className = 'leaderboard-title';
  title.textContent = 'Top Players This Week';

  const content = document.createElement('div');

  content.className = 'leaderboard-content';

  section.append(title, content);

  async function loadLeaderboard(): Promise<void> {
    showLoading();

    try {
      const response = await getLeaderboard();

      if (response.meta.description) {
        title.textContent = response.meta.description;
      }

      if (response.data.length === 0) {
        showEmpty();

        return;
      }

      renderTable(response.data);
    } catch {
      showError();

      showSnackbar(
        'Failed to load leaderboard.',
        'error',
      );
    }
  }

  function showLoading(): void {
    const skeleton = document.createElement('div');

    skeleton.className = 'leaderboard-skeleton';

    const header = document.createElement('div');

    header.className = 'leaderboard-skeleton-header';

    skeleton.append(header);

    for (let index = 0; index < 5; index += 1) {
      const row = document.createElement('div');

      row.className = 'leaderboard-skeleton-row';

      for (
        let column = 0;
        column < 6;
        column += 1
      ) {
        const cell = document.createElement('div');

        cell.className = 'leaderboard-skeleton-cell';

        row.append(cell);
      }

      skeleton.append(row);
    }

    content.replaceChildren(skeleton);
  }

  function showEmpty(): void {
    const empty = document.createElement('div');

    empty.className = 'leaderboard-empty';

    const message = document.createElement('p');

    message.textContent =
      'No leaderboard data is available yet.';

    empty.append(message);

    content.replaceChildren(empty);
  }

  function showError(): void {
    const error = document.createElement('div');

    error.className = 'leaderboard-error';

    const message = document.createElement('p');

    message.textContent =
      'Something went wrong while loading the leaderboard.';

    const retryButton =
      document.createElement('button');

    retryButton.className =
      'leaderboard-retry-button';

    retryButton.type = 'button';

    retryButton.textContent = 'Retry';

    retryButton.addEventListener('click', () => {
      void loadLeaderboard();
    });

    error.append(message, retryButton);

    content.replaceChildren(error);
  }

  function renderTable(
    players: LeaderboardPlayer[],
  ): void {
    const container =
      document.createElement('div');

    container.className =
      'leaderboard-table-container';

    const table =
      document.createElement('table');

    table.className = 'leaderboard-table';

    const thead =
      document.createElement('thead');

    const headerRow =
      document.createElement('tr');

    const headings = [
      'Rank',
      'Player',
      'Games Played',
      'Total Score',
      'Streak',
      'Favorite Game',
    ];

    headings.forEach((heading) => {
      const th = document.createElement('th');

      th.scope = 'col';
      th.textContent = heading;

      headerRow.append(th);
    });

    thead.append(headerRow);

    const tbody =
      document.createElement('tbody');

    players.forEach((player) => {
      tbody.append(createPlayerRow(player));
    });

    table.append(thead, tbody);

    container.append(table);

    content.replaceChildren(container);
  }

  void loadLeaderboard();

  return section;
}

function createPlayerRow(
  player: LeaderboardPlayer,
): HTMLTableRowElement {
  const row = document.createElement('tr');

  row.className = 'leaderboard-row';

  const rankCell =
    document.createElement('td');

  rankCell.className = 'leaderboard-rank';

  rankCell.textContent = `#${player.rank}`;

  if (player.rank === 1) {
    rankCell.classList.add(
      'leaderboard-rank-first',
    );
  }

  const playerCell =
    document.createElement('td');

  const playerWrapper =
    document.createElement('div');

  playerWrapper.className =
    'leaderboard-player';

  const avatar =
    document.createElement('span');

  avatar.className =
    'leaderboard-avatar';

  avatar.dataset.rank = String(player.rank);

  avatar.textContent =
    getPlayerInitials(player.playerName);

  const playerName =
    document.createElement('span');

  playerName.className =
    'leaderboard-player-name';

  playerName.textContent =
    player.playerName;

  playerWrapper.append(avatar, playerName);

  playerCell.append(playerWrapper);

  const gamesPlayedCell =
    document.createElement('td');

  gamesPlayedCell.textContent =
    String(player.gamesPlayed);

  const totalScoreCell =
    document.createElement('td');

  totalScoreCell.className =
    'leaderboard-score';

  totalScoreCell.textContent =
    formatScore(player.totalScore);

  const streakCell =
    document.createElement('td');

  const streak =
    document.createElement('span');

  streak.className = 'leaderboard-streak';

  const fire =
    document.createElement('span');

  fire.className =
    'leaderboard-streak-icon';

  fire.textContent = '🔥';

  fire.setAttribute('aria-hidden', 'true');

  const streakText =
    document.createElement('span');

  streakText.textContent =
    `${player.streakDays} ${
      player.streakDays === 1
        ? 'day'
        : 'days'
    }`;

  streak.append(fire, streakText);

  streakCell.append(streak);

  const favoriteGameCell =
    document.createElement('td');

  const favoriteGame =
    document.createElement('span');

  favoriteGame.className =
    'leaderboard-favorite-game';

  favoriteGame.textContent =
    player.favoriteGameName;


  favoriteGame.dataset.slug =
    player.favoriteGameSlug;

  favoriteGameCell.append(favoriteGame);

  row.append(
    rankCell,
    playerCell,
    gamesPlayedCell,
    totalScoreCell,
    streakCell,
    favoriteGameCell,
  );

  return row;
}

function formatScore(score: number): string {
  return new Intl.NumberFormat(
    'en-US',
  ).format(score);
}

function getPlayerInitials(
  playerName: string,
): string {
  const capitalLetters =
    playerName.match(/[A-Z]/g);

  if (
    capitalLetters &&
    capitalLetters.length >= 2
  ) {
    return capitalLetters
      .slice(0, 2)
      .join('');
  }

  const words = playerName
    .split(/[_\-\s]+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return (
      words[0][0] + words[1][0]
    ).toUpperCase();
  }

  return playerName
    .slice(0, 2)
    .toUpperCase();
}