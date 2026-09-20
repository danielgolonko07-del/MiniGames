import { createHeader } from '../components/header/header.ts';
import { createAuthDialog } from '../components/auth-dialog/auth-dialog';
export function createHomePage(): HTMLElement {
  const page = document.createElement('div');

  page.id = 'home';

  // Tworzymy modal.
  const authDialog = createAuthDialog();

  // Przekazujemy Headerowi funkcję otwierającą modal.
  const header = createHeader(authDialog.open);

  // Dokładamy Header i modal do strony.
  page.append(header, authDialog.element);

  return page;
}