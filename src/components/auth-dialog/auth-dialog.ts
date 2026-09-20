type AuthMode = "login" | "register";

interface AuthDialog {
  element: HTMLDialogElement;
  open: (mode?: AuthMode) => void;
}

export function createAuthDialog(): AuthDialog {
  const dialog = document.createElement("dialog");
  dialog.className = "auth-dialog";
  dialog.setAttribute("aria-labelledby", "auth-login-title");

  dialog.innerHTML = `
    <div class="auth-dialog-content">
      <div class="auth-dialog-tabs" aria-label="Choose authentication form">
        <button class="auth-dialog-tab auth-dialog-tab-active" type="button"
          data-mode="login" aria-pressed="true">Login</button>
        <button class="auth-dialog-tab" type="button"
          data-mode="register" aria-pressed="false">Register</button>
      </div>

      <form class="auth-dialog-form" id="auth-login-form">
        <h2 class="auth-dialog-title" id="auth-login-title">Welcome Back!</h2>
        <p class="auth-dialog-description">Sign in to resume your games and progress.</p>

        <div class="auth-dialog-field">
          <label for="auth-login-email">Email Address</label>
          <div class="auth-dialog-input-wrapper">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>
            <input id="auth-login-email" name="email" type="email"
              placeholder="e.g. alex@minigames.com" autocomplete="email" required />
          </div>
        </div>

        <div class="auth-dialog-field">
          <label for="auth-login-password">Password</label>
          <div class="auth-dialog-input-wrapper">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
            <input id="auth-login-password" name="password" type="password"
              placeholder="Enter your password" autocomplete="current-password" required />
            <button class="auth-dialog-eye" type="button" data-password="auth-login-password"
              aria-label="Show password" aria-pressed="false">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <span class="auth-dialog-forgot">Forgot Password?</span>
        <button class="auth-dialog-submit" type="submit">Login</button>
        <div class="auth-dialog-divider"><span>OR</span></div>
        <button class="auth-dialog-google" type="button" disabled
          title="Google sign-in is not implemented in Story 1">
          <span class="auth-dialog-google-icon" aria-hidden="true">G</span>
          Continue with Google
        </button>
        <p class="auth-dialog-bottom">Don't have an account?
          <button type="button" data-mode="register">Register</button>
        </p>
      </form>

      <form class="auth-dialog-form" id="auth-register-form" hidden>
        <h2 class="auth-dialog-title" id="auth-register-title">Create Account</h2>
        <p class="auth-dialog-description">Join MiniGames to track your score &amp; streak.</p>

        <div class="auth-dialog-field">
          <label for="auth-register-name">Username</label>
          <div class="auth-dialog-input-wrapper">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M4 20v-2a8 8 0 0 1 16 0v2Z"/></svg>
            <input id="auth-register-name" name="username" type="text"
              placeholder="e.g. CozyGamer_99" autocomplete="username" required />
          </div>
        </div>

        <div class="auth-dialog-field">
          <label for="auth-register-email">Email Address</label>
          <div class="auth-dialog-input-wrapper">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>
            <input id="auth-register-email" name="email" type="email"
              placeholder="your.email@domain.com" autocomplete="email" required />
          </div>
        </div>

        <div class="auth-dialog-field">
          <label for="auth-register-password">Password</label>
          <div class="auth-dialog-input-wrapper">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
            <input id="auth-register-password" name="password" type="password"
              placeholder="Min. 8 characters" autocomplete="new-password" minlength="8" required />
          </div>
        </div>

        <div class="auth-dialog-field">
          <label for="auth-register-confirm">Confirm Password</label>
          <div class="auth-dialog-input-wrapper">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
            <input id="auth-register-confirm" name="confirmPassword" type="password"
              placeholder="Repeat your password" autocomplete="new-password" required />
          </div>
        </div>

        <button class="auth-dialog-submit" type="submit">Create Account</button>
        <div class="auth-dialog-divider"><span>OR</span></div>
        <button class="auth-dialog-google" type="button" disabled
          title="Google sign-up is not implemented in Story 1">
          <span class="auth-dialog-google-icon" aria-hidden="true">G</span>
          Sign up with Google
        </button>
        <p class="auth-dialog-bottom">Already have an account?
          <button type="button" data-mode="login">Login</button>
        </p>
      </form>
    </div>
  `;

  const loginForm = dialog.querySelector<HTMLFormElement>("#auth-login-form")!;
  const registerForm = dialog.querySelector<HTMLFormElement>(
    "#auth-register-form",
  )!;
  const tabs = dialog.querySelectorAll<HTMLButtonElement>(".auth-dialog-tab");

  let closing = false;
  let previousFocus: HTMLElement | null = null;

  function setMode(mode: AuthMode): void {
    loginForm.hidden = mode !== "login";
    registerForm.hidden = mode !== "register";
    dialog.setAttribute(
      "aria-labelledby",
      mode === "login" ? "auth-login-title" : "auth-register-title",
    );

    tabs.forEach((tab) => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle("auth-dialog-tab-active", active);
      tab.setAttribute("aria-pressed", String(active));
    });

    if (dialog.open) {
      const form = mode === "login" ? loginForm : registerForm;
      form.querySelector<HTMLInputElement>("input")?.focus();
    }
  }

  function open(mode: AuthMode = "login"): void {
    if (dialog.open) {
      if (!closing) setMode(mode);
      return;
    }

    previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setMode(mode);
    dialog.showModal();
    (mode === "login" ? loginForm : registerForm)
      .querySelector<HTMLInputElement>("input")
      ?.focus();
  }

  function close(): void {
    if (!dialog.open || closing) return;
    closing = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
    } else {
      dialog.classList.add("auth-dialog-closing");
    }
  }

  dialog.addEventListener("animationend", (event) => {
    if (
      event.target === dialog &&
      closing &&
      event.animationName === "auth-dialog-out"
    ) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    closing = false;
    dialog.classList.remove("auth-dialog-closing");

    if (previousFocus?.isConnected && !previousFocus.closest("[inert]")) {
      previousFocus.focus();
    }
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  dialog
    .querySelectorAll<HTMLButtonElement>("[data-mode]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.mode === "register") setMode("register");
        if (button.dataset.mode === "login") setMode("login");
      });
    });

  dialog
    .querySelectorAll<HTMLButtonElement>("[data-password]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const input = dialog.querySelector<HTMLInputElement>(
          `#${button.dataset.password}`,
        );
        if (!input) return;

        const showPassword = input.type === "password";
        input.type = showPassword ? "text" : "password";
        button.setAttribute(
          "aria-label",
          showPassword ? "Hide password" : "Show password",
        );
        button.setAttribute("aria-pressed", String(showPassword));
      });
    });

  dialog.querySelectorAll<HTMLFormElement>("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  });

  return { element: dialog, open };
}
