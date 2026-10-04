import { createHeader } from '../components/header/header';
import { createAuthDialog } from '../components/auth-dialog/auth-dialog';
import { createLibrary } from '../components/library/library';
import { createFooter } from '../components/footer/footer';
import type { PageRoute } from '../app/router';

export function createLibraryPage(
  openGameDetails: (slug: string) => void,

  navigate: (path: PageRoute) => void,
): HTMLElement {
  const page = document.createElement('div');

  page.id = 'library';

  const authDialog = createAuthDialog();

  const header = createHeader(authDialog.open, navigate);

  const library = createLibrary(openGameDetails);

  const footer = createFooter(navigate);

  page.append(header, library, footer, authDialog.element);

  return page;
}
