type AuthMode = 'login' | 'register';

export function createHeader(openAuth: (mode: AuthMode) => void): HTMLElement {
  const header = document.createElement('header');
  header.className = 'header';


  const links = `
    <a href="#home" class="header-link" aria-current="page">Home</a>
    <a href="#home" class="header-link">Library</a>
    <a href="#home" class="header-link">Tournaments</a>
    <a href="#home" class="header-link">Community</a>
  `;

  const logo = `
    <a href="#home" class="header-logo" aria-label="MiniGames, Home">
      <img src="src/assets/assets/Vector.png" alt="MiniGames logo">
      <span>MiniGames</span>
    </a>
  `;

  header.innerHTML = `
    <div class="header-container">
      ${logo}

      <nav class="header-navigation" aria-label="Main navigation">
        ${links}
      </nav>

      <div class="header-actions">
        <button class="header-login" type="button" data-auth="login">Log In</button>
        <button class="header-signup" type="button" data-auth="register">Sign Up</button>

        <button class="header-burger" type="button" aria-label="Open menu"
          aria-controls="mobile-menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <div class="mobile-menu" id="mobile-menu" aria-hidden="true" inert>
      <div class="mobile-menu-top">
        ${logo}
        <button class="mobile-menu-close" type="button" aria-label="Close menu">&times;</button>
      </div>

      <nav class="mobile-menu-navigation" aria-label="Mobile navigation">
        ${links}
      </nav>

      <div class="mobile-menu-actions">
        <button class="mobile-menu-login" type="button" data-auth="login">Log In</button>
        <button class="mobile-menu-signup" type="button" data-auth="register">Sign Up</button>
      </div>
    </div>
  `;

  const burger = header.querySelector<HTMLButtonElement>('.header-burger')!;
  const menu = header.querySelector<HTMLElement>('.mobile-menu')!;
  const closeButton = header.querySelector<HTMLButtonElement>('.mobile-menu-close')!;

  let menuOpen = false;

  function openMenu(): void {
    menuOpen = true;
    menu.inert = false;
    menu.setAttribute('aria-hidden', 'false');
    header.classList.add('header-menu-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    closeButton.focus();
  }

  function closeMenu(focusBurger = true): void {
    if (!menuOpen) return;

    menuOpen = false;
    menu.inert = true;
    menu.setAttribute('aria-hidden', 'true');
    header.classList.remove('header-menu-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');

    if (focusBurger) burger.focus();
  }

  burger.addEventListener('click', () => {
    if (menuOpen) closeMenu();
    else openMenu();
  });

  closeButton.addEventListener('click', () => closeMenu());

  menu.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu(false));
  });

  header.querySelectorAll<HTMLButtonElement>('[data-auth]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode: AuthMode = button.dataset.auth === 'register' ? 'register' : 'login';
      closeMenu(false);
      openAuth(mode);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && menuOpen) closeMenu(false);
  });

  return header;
}
