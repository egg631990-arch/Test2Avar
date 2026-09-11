/* ============================================================
   1. TELEGRAM WEBAPP — АВАТАР
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    const user = Telegram.WebApp.initDataUnsafe?.user;
    if (user) {
      const avatarImg = document.getElementById('avatar-img');
      if (user.photo_url) {
        avatarImg.src = user.photo_url;
      } else {
        const firstName = user.first_name || '?';
        avatarImg.src = 'https://via.placeholder.com/100/cccccc/666666?text=' + firstName[0];
      }
    }
    Telegram.WebApp.ready();
  }
});


/* ============================================================
   2. ПЛАВНЫЙ ПЕРЕХОД ПО #We
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const link = document.getElementById('We');
  if (!link) return;
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    setTimeout(() => { window.location.href = href; }, 300);
  });
});


/* ============================================================
   3. КАРУСЕЛЬ — БЕСКОНЕЧНАЯ 1→2→3→1
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const corusel = document.querySelector('.Corusel');
  if (!corusel) return;

  const originals = Array.from(corusel.children);
  const total = originals.length;
  corusel.appendChild(originals[0].cloneNode(true));

  let currentIndex = 0;
  let isJumping = false;
  let interval;

  function getItemWidth() {
    const first = corusel.querySelector('img');
    const gap = parseFloat(getComputedStyle(corusel).gap) || 0;
    return first.offsetWidth + gap;
  }

  function goTo(index) {
    corusel.scrollTo({ left: index * getItemWidth(), behavior: 'smooth' });
    currentIndex = index;
  }

  function next() {
    if (isJumping) return;
    goTo(currentIndex + 1);
  }

  let scrollTimer;
  corusel.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const w = getItemWidth();
      const current = Math.round(corusel.scrollLeft / w);
      if (current >= total) {
        isJumping = true;
        corusel.style.scrollBehavior = 'auto';
        corusel.scrollLeft = 0;
        currentIndex = 0;
        requestAnimationFrame(() => {
          corusel.style.scrollBehavior = 'smooth';
          isJumping = false;
        });
      } else {
        currentIndex = current;
      }
    }, 150);
  });

  function startAuto() {
    interval = setInterval(next, 3000);
  }
  startAuto();

  corusel.addEventListener('mouseenter', () => clearInterval(interval));
  corusel.addEventListener('mouseleave', startAuto);
  ['touchstart', 'mousedown', 'wheel'].forEach(evt => {
    corusel.addEventListener(evt, () => {
      clearInterval(interval);
      clearTimeout(corusel._resume);
      corusel._resume = setTimeout(startAuto, 4000);
    });
  });
});


/* ============================================================
   4. ЭКРАН ЗАГРУЗКИ
   ============================================================ */
window.addEventListener('load', function () {
  setTimeout(function () {
    const loading = document.getElementById('Loading');
    if (!loading) return;
    loading.style.opacity = '0';
    setTimeout(function () {
      loading.style.display = 'none';
      document.body.style.overflow = '';
    }, 500);
  }, 3000);
});


/* ============================================================
   5. СТЕКЛО — КНОПКА «+»
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const payBtn       = document.getElementById('Pay');
  const glassOverlay = document.getElementById('glass-overlay');
  const glassPanel   = document.getElementById('glass-panel');
  if (!payBtn || !glassOverlay) return;

  payBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    glassOverlay.classList.toggle('active');
  });

  glassOverlay.addEventListener('click', () => {
    glassOverlay.classList.remove('active');
  });

  if (glassPanel) {
    glassPanel.addEventListener('click', (e) => e.stopPropagation());
  }
});


/* ============================================================
   6. БАЛАНС + ПАНЕЛЬ ПОПОЛНЕНИЯ
   ============================================================ */
const BalanceAPI = {
  get(cb) {
    if (window.Telegram?.WebApp) {
      Telegram.WebApp.CloudStorage.getItem('userBalance', (err, val) => {
        cb(parseInt(val || '0', 10));
      });
    } else {
      cb(parseInt(localStorage.getItem('userBalance') || '0', 10));
    }
  },
  set(value, cb) {
    if (window.Telegram?.WebApp) {
      Telegram.WebApp.CloudStorage.setItem('userBalance', String(value), () => cb?.(value));
    } else {
      localStorage.setItem('userBalance', String(value));
      cb?.(value);
    }
  },
  add(amount, cb) {
    this.get(current => this.set(current + amount, cb));
  }
};
window.BalanceAPI = BalanceAPI;

/* 🔥 Вызывай эту функцию, когда оплата прошла успешно */
window.onPaymentSuccess = function (amount) {
  BalanceAPI.add(amount, newBalance => {
    const balanceEl = document.getElementById('balance-value');
    if (balanceEl) balanceEl.textContent = newBalance;

    window.dispatchEvent(new Event('balanceUpdated'));
    document.getElementById('glass-overlay')?.classList.remove('active');

    const si = document.getElementById('stars-input');
    const sd = document.getElementById('stars-display');
    const pb = document.getElementById('pay-stars');
    if (si) si.value = 0;
    if (sd) sd.textContent = 0;
    if (pb) pb.disabled = true;
  });
};


document.addEventListener('DOMContentLoaded', () => {
  const methods      = document.querySelectorAll('.method');
  const contents     = document.querySelectorAll('.method-content');
  const methodName   = document.getElementById('method-name');
  const starsInput   = document.getElementById('stars-input');
  const starsDisplay = document.getElementById('stars-display');
  const payStarsBtn  = document.getElementById('pay-stars');
  const balanceEl    = document.getElementById('balance-value');

  const names = { gifts: 'Gifts', stars: 'Stars', cryptobot: 'CryptoBot', ton: 'Ton' };

  /* Переключение методов */
  methods.forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.method;
      methods.forEach(b => b.classList.toggle('active', b === btn));
      contents.forEach(c => c.hidden = c.dataset.content !== m);
      methodName.textContent = names[m];
    });
  });

  /* Ввод звёзд */
  if (starsInput && payStarsBtn && starsDisplay) {
    const update = () => {
      const v = parseInt(starsInput.value) || 0;
      starsDisplay.textContent = v;
      payStarsBtn.disabled = v < 10;
    };

    starsInput.addEventListener('input', update);
    starsInput.addEventListener('blur', () => {
      let v = parseInt(starsInput.value) || 0;
      if (v < 10) v = 10;
      starsInput.value = v;
      update();
    });

    /* ============================================================
       🔥🔥🔥 КНОПКА "Пополнить N⭐" — СЮДА ВСТАВЬ СВОЙ КОД ОПЛАТЫ 🔥🔥🔥
       ============================================================ */
    payStarsBtn.addEventListener('click', () => {
      const amount = parseInt(starsInput.value) || 0;
      if (amount < 10) return;

      /* ============================================
         ВСТАВЬ ТУТ ОДНУ СТРОЧКУ — ВЫЗОВ ТВОЕЙ ФУНКЦИИ ОПЛАТЫ
         ============================================
         Например:

         buyStars(amount);

         — или —

         createStarsInvoice(amount);

         — или —

         Telegram.WebApp.openInvoice('твоя_ссылка', (status) => {
           if (status === 'paid') window.onPaymentSuccess(amount);
         });

         ============================================ */

      // ↓↓↓ УДАЛИ ЭТУ СТРОЧКУ, КОГДА ВСТАВИШЬ СВОЮ ОПЛАТУ ↓↓↓
      window.onPaymentSuccess(amount);
      // ↑↑↑ ЗАГЛУШКА — просто зачисляет баланс без реальной оплаты ↑↑↑

      /* ============================================ */
    });
  }

  if (balanceEl) BalanceAPI.get(v => balanceEl.textContent = v);
});