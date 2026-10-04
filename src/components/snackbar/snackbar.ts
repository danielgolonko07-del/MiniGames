type SnackbarType = 'success' | 'error';

let snackbarTimer: number | undefined;

export function showSnackbar(message: string, type: SnackbarType): void {
  let snackbar = document.querySelector<HTMLDivElement>('.snackbar');

  if (!snackbar) {
    snackbar = document.createElement('div');

    snackbar.className = 'snackbar';

    document.body.append(snackbar);
  }

  snackbar.textContent = message;
  snackbar.className = `snackbar snackbar-${type} snackbar-show`;

  window.clearTimeout(snackbarTimer);

  snackbarTimer = window.setTimeout(() => {
    snackbar?.classList.remove('snackbar-show');
  }, 3000);
}
