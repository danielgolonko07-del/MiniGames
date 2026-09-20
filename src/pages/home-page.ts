import { createHeader } from '../components/header/header.ts';
import { createAuthDialog } from '../components/auth-dialog/auth-dialog';


export function createHomePage(): HTMLElement {
  const page = document.createElement('div');

  page.id = 'home';

  const authDialog = createAuthDialog();

  const header = createHeader(authDialog.open);


  page.append(header, authDialog.element,);

  return page;
}