import { createHeader } from '../components/header/header.ts';
import { createAuthDialog } from '../components/auth-dialog/auth-dialog';
import { createHero } from '../components/hero/hero.ts';
import { createNewGames } from '../components/new-games/new-games.ts';


export function createHomePage(): HTMLElement {
  const page = document.createElement('div');

  page.id = 'home';

  const authDialog = createAuthDialog();

  const header = createHeader(authDialog.open);

  const hero = createHero();

  const newGames = createNewGames(() => {});

  page.append(header, hero, newGames, authDialog.element,);

  return page;
}