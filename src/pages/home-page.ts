import { createHeader } from '../components/header/header.ts';
import { createAuthDialog } from '../components/auth-dialog/auth-dialog';
import { createHero } from '../components/hero/hero.ts';


export function createHomePage(): HTMLElement {
  const page = document.createElement('div');

  page.id = 'home';

  const authDialog = createAuthDialog();

  const header = createHeader(authDialog.open);

  const hero = createHero();

  page.append(header, hero, authDialog.element,);

  return page;
}