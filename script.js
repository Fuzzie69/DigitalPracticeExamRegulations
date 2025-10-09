const link = document.getElementById('redirect-link');
const secondsEl = document.getElementById('seconds');

const DEFAULT_SECONDS = 5;
// Allow override via ?to=...&delay=...
const params = new URLSearchParams(location.search);
const target = params.get('to') || link.getAttribute('href') || '/';
const delay = Math.max(1, Number(params.get('delay') || DEFAULT_SECONDS));

let remaining = delay;
secondsEl.textContent = remaining;

const tick = setInterval(() => {
  remaining -= 1;
  secondsEl.textContent = remaining;
  if (remaining <= 0) {
    clearInterval(tick);
    window.location.href = target;
  }
}, 1000);

// Keep link in sync if ?to=... was provided
if (params.get('to')) link.setAttribute('href', target);

