/**
 * Shared form helpers plus the email-capture form.
 * There is no backend: submissions resolve after a mocked 1s delay.
 */
const MOCK_DELAY_MS = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Please enter your email address.';
  if (!EMAIL_RE.test(v)) return 'That doesn’t look like a valid email address.';
  return '';
}

/** Show or clear an inline error, keeping aria-invalid in sync. */
export function setFieldError(input, errorEl, message) {
  errorEl.textContent = message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

/** Swap a button into a busy state and back. */
export function setBusy(button, busy, busyLabel = 'Sending…') {
  const label = button.querySelector('.btn__label') || button;
  button.disabled = busy;
  button.setAttribute('aria-busy', String(busy));
  label.textContent = busy ? busyLabel : button.dataset.label || label.textContent;
}

export function initCaptureForm() {
  const form = document.getElementById('capture-form');
  if (!form) return;
  const input = form.querySelector('#capture-email');
  const error = form.querySelector('#capture-error');
  const button = form.querySelector('button[type="submit"]');
  const success = document.getElementById('capture-success');

  // Clear the error as soon as the user starts fixing it
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid')) setFieldError(input, error, '');
  });
  input.addEventListener('blur', () => {
    if (input.value) setFieldError(input, error, validateEmail(input.value));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = validateEmail(input.value);
    setFieldError(input, error, message);
    if (message) {
      input.focus();
      return;
    }

    setBusy(button, true);
    input.readOnly = true;
    await wait(MOCK_DELAY_MS);

    form.hidden = true;
    success.hidden = false;
    // Move focus so screen readers land on the confirmation
    success.setAttribute('tabindex', '-1');
    success.focus({ preventScroll: true });
  });
}
