export function createHero(): HTMLElement {
  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.setAttribute('aria-labelledby', 'hero-title');

  hero.innerHTML = `
    <div class="hero-container">
      <div class="hero-card">
        <h1 class="hero-title" id="hero-title">Take a Short Break &amp; Have Fun</h1>
        <p class="hero-description">
          Discover hundreds of curated casual mini-games. Play instantly in your
          browser — puzzle, match 3, farm, and board classics.
        </p>
        <button class="hero-button" type="button">Browse Library</button>
      </div>
    </div>
  `;

  return hero;
}
