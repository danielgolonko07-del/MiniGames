import type {
  PageRoute,
} from '../../app/router';

export function createFooter(
  navigate: (
    path: PageRoute,
  ) => void,
): HTMLElement {
  const footer =
    document.createElement(
      'footer',
    );

  footer.className =
    'footer';

  const container =
    document.createElement(
      'div',
    );

  container.className =
    'footer-container';

  /*
   * LEFT
   */

  const brand =
    document.createElement(
      'div',
    );

  brand.className =
    'footer-brand';

  const logo =
    document.createElement(
      'div',
    );

  logo.className =
    'footer-logo';

  logo.innerHTML = `
    <span
      class="footer-logo-icon"
      aria-hidden="true"
    >
      ✚
    </span>

    <span>
      MiniGames
    </span>
  `;

  const description =
    document.createElement(
      'p',
    );

  description.className =
    'footer-description';

  description.textContent =
    'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.';

  brand.append(
    logo,
    description,
  );

  /*
   * EXPLORE
   */

  const explore =
    createFooterColumn(
      'Explore',
    );

  explore.append(
    createSpaLink(
      'Home',
      '/home',
      navigate,
    ),

    createSpaLink(
      'Library',
      '/library',
      navigate,
    ),

    createSpaLink(
      'Categories',
      '/library',
      navigate,
    ),

    createSpaLink(
      'Tournaments',
      '/home',
      navigate,
    ),
  );

  /*
   * COMPANY
   */

  const company =
    createFooterColumn(
      'Company',
    );

  company.append(
    createPlaceholderLink(
      'About Us',
    ),

    createPlaceholderLink(
      'Contact',
    ),

    createPlaceholderLink(
      'Privacy Policy',
    ),

    createPlaceholderLink(
      'Terms of Service',
    ),
  );

  /*
   * COMMUNITY
   */

  const community =
    createFooterColumn(
      'Community',
    );

  const social =
    document.createElement(
      'div',
    );

  social.className =
    'footer-social';

  social.append(
    createExternalIconLink(
      'GitHub',
      'https://github.com/danielgolonko07-del',
      '⌘',
    ),

    createExternalIconLink(
      'RS School',
      'https://rs.school/',
      '▤',
    ),

    createExternalIconLink(
      'RSS',
      'https://rs.school/',
      '◔',
    ),
  );

  community.append(social);

  /*
   * TOP AREA
   */

  const navigation =
    document.createElement(
      'div',
    );

  navigation.className =
    'footer-navigation';

  navigation.append(
    explore,
    company,
    community,
  );

  const top =
    document.createElement(
      'div',
    );

  top.className =
    'footer-top';

  top.append(
    brand,
    navigation,
  );

  /*
   * BOTTOM
   */

  const bottom =
    document.createElement(
      'div',
    );

  bottom.className =
    'footer-bottom';

  const copyright =
    document.createElement(
      'span',
    );

  copyright.textContent =
    '© 2026 MiniGames. All rights reserved.';

  const rsschool =
    document.createElement('a');

  rsschool.href =
    'https://rs.school/';

  rsschool.target =
    '_blank';

  rsschool.rel =
    'noopener noreferrer';

  rsschool.textContent =
    '▣  RS School';

  const github =
    document.createElement('a');

  github.href =
    'https://github.com/danielgolonko07-del';

  github.target =
    '_blank';

  github.rel =
    'noopener noreferrer';

  github.textContent =
    '◉  @danielgolonko07-del';

  const designed =
    document.createElement(
      'span',
    );

  designed.textContent =
    'Designed with love';

  bottom.append(
    copyright,
    rsschool,
    github,
    designed,
  );

  container.append(
    top,
    bottom,
  );

  footer.append(container);

  return footer;
}

function createFooterColumn(
  title: string,
): HTMLElement {
  const column =
    document.createElement(
      'div',
    );

  column.className =
    'footer-column';

  const heading =
    document.createElement(
      'h3',
    );

  heading.textContent =
    title;

  column.append(heading);

  return column;
}

function createSpaLink(
  text: string,
  route: PageRoute,
  navigate: (
    path: PageRoute,
  ) => void,
): HTMLAnchorElement {
  const link =
    document.createElement(
      'a',
    );

  link.href =
    `${import.meta.env.BASE_URL}${route.slice(1)}`;

  link.textContent =
    text;

  link.addEventListener(
    'click',
    (event) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();

      navigate(route);
    },
  );

  return link;
}

function createPlaceholderLink(
  text: string,
): HTMLAnchorElement {
  const link =
    document.createElement(
      'a',
    );

  link.href = '#';

  link.textContent =
    text;

  link.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
    },
  );

  return link;
}

function createExternalIconLink(
  label: string,
  href: string,
  icon: string,
): HTMLAnchorElement {
  const link =
    document.createElement(
      'a',
    );

  link.className =
    'footer-social-link';

  link.href =
    href;

  link.target =
    '_blank';

  link.rel =
    'noopener noreferrer';

  link.textContent =
    icon;

  link.setAttribute(
    'aria-label',
    label,
  );

  return link;
}