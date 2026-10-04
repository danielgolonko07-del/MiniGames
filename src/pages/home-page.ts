import { createHeader } from '../components/header/header.ts';
import { createAuthDialog } from '../components/auth-dialog/auth-dialog';
import { createHero } from '../components/hero/hero.ts';
import { createNewGames } from '../components/new-games/new-games.ts';
import { createLeaderboard } from '../components/leaderboard/leaderboard';


export function createHomePage(): HTMLElement {
  const page = document.createElement('div');

  page.id = 'home';

  const authDialog = createAuthDialog();

  const header = createHeader(authDialog.open);

  const hero = createHero();

  const newGames = createNewGames(() => {});

  const leaderboard = createLeaderboard();

  page.append(header, hero, newGames, leaderboard, authDialog.element,);

  return page;
}