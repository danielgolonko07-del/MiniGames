import { createHomePage } from '../pages/home-page.ts';

export function createApp(): HTMLElement {
  const app = document.createElement('div');

  app.id = 'app';
  app.append(createHomePage());

  return app;
}