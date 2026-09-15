/**
 * Brand application modal. Uses the native <dialog> for top-layer + inert
 * background, with an explicit Tab trap so focus never escapes the card in
 * browsers that still leak it. Esc and overlay clicks close it; focus returns
 * to the button that opened it.
 */
import { setBusy, setFieldError, validateEmail, wait } from './forms.js';

const MOCK_DELAY_MS = 1000;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function validateBrandForm(form) {
  const errors = [];
  const check = (id, message) => {
    const input = form.querySelector(`#${id}`);
    const error = form.querySelector(`#${id}-error`);
    setFieldError(input, error, message);
    if (message) errors.push(input);
  };

  const name = form.querySelector('#brand-name').value.trim();
  check('brand-name', name ? '' : 'Please enter your brand name.');

  const site = form.querySelector('#brand-website').value.trim();
  let siteMsg = '';
  if (!site) siteMsg = 'Please enter your website.';
  else {
    try {
      const url = new URL(site.includes('://') ? site : `https://${site}`);
      if (!url.hostname.includes('.')) siteMsg = 'Please enter a valid website address.';
    } catch {
      siteMsg = 'Please enter a valid website address.';
    }
  }
  check('brand-website', siteMsg);

  const category = form.querySelector('#brand-category').value;
  check('brand-category', category ? '' : 'Please choose a category.');

  check('brand-email', validateEmail(form.querySelector('#brand-email').value));

  return errors;
}

export function initModal() {
  const dialog = document.getElementById('brand-modal');
  const opener = document.getElementById('open-brand-modal');
  if (!dialog || !opener) return;

  const card = dialog.querySelector('.modal__card');
  const form = dialog.querySelector('#brand-form');
  const success = dialog.querySelector('#brand-success');
  const submit = form.querySelector('button[type="submit"]');
  let lastFocus = null;

  const focusables = () => [...card.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);

  const open = () => {
    lastFocus = document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    const first = form.hidden ? focusables()[0] : form.querySelector('#brand-name');
    first?.focus();
  };

  const close = () => {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    document.body.style.overflow = '';
    lastFocus?.focus();
  };

  opener.addEventListener('click', open);
  dialog.querySelectorAll('[data-close-modal]').forEach((btn) => btn.addEventListener('click', close));

  // Overlay click: the dialog element itself is the backdrop hit area; the card swallows clicks inside
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });

  // Native Esc fires 'cancel'; route it through close() so focus restoration runs
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  form.querySelectorAll('input, select').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid')) setFieldError(input, form.querySelector(`#${input.id}-error`), '');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = validateBrandForm(form);
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    setBusy(submit, true, 'Submitting…');
    await wait(MOCK_DELAY_MS);
    form.hidden = true;
    success.hidden = false;
    dialog.querySelector('.modal__close').focus();
  });
}
