import { createHeader } from '../components/header/header';
import { createFooter } from '../components/footer/footer.ts';

import type {
  AuthRouteMode,
  PageRoute,
} from '../app/router';

export function createNotFoundPage(
  navigate: (path: PageRoute) => void,
  openAuth: (mode: AuthRouteMode) => void,
): HTMLElement {
  const page =
    document.createElement('div');

  page.className =
    'not-found-page';

  const header =
    createHeader(
      openAuth,
      navigate,
    );

  const main =
    document.createElement('main');

  main.className =
    'not-found';

  const code =
    document.createElement('h1');

  code.className =
    'not-found-code';

  code.textContent =
    '404';

  const title =
    document.createElement('h2');

  title.className =
    'not-found-title';

  title.textContent =
    'Page Not Found';

  const description =
    document.createElement('p');

  description.className =
    'not-found-description';

  description.textContent =
    'The page you are looking for does not exist or has been moved.';

  const homeButton =
    document.createElement('button');

  homeButton.type =
    'button';

  homeButton.className =
    'not-found-button';

  homeButton.textContent =
    'Return to Home';

  homeButton.addEventListener(
    'click',
    () => {
      navigate('/home');
    },
  );

  main.append(
    code,
    title,
    description,
    homeButton,
  );

  const footer =
    createFooter(navigate);

  page.append(
    header,
    main,
    footer,
  );


   page.append(header, footer);

  return page;
}