// Ждём полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  // Проверяем, доступен ли Telegram WebApp
  if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    const user = Telegram.WebApp.initDataUnsafe?.user;
    if (user) {
      const avatarImg = document.getElementById('avatar-img');
      // Если есть photo_url – используем его, иначе ставим заглушку
      if (user.photo_url) {
        avatarImg.src = user.photo_url;
      } else {
        // Инициалы или дефолтная картинка
        const firstName = user.first_name || '?';
        avatarImg.src = 'https://via.placeholder.com/100/cccccc/666666?text=' + firstName[0];
      }
      // Можно вывести имя в консоль для отладки
      console.log('Привет, ' + user.first_name);
    } else {
      console.warn('Пользователь не авторизован (запуск не в Telegram)');
    }
    // Обязательно уведомляем Telegram о готовности приложения
    Telegram.WebApp.ready();
  } else {
    console.warn('Telegram WebApp SDK не загружен');
  }
});
document.addEventListener('DOMContentLoaded', function() {
  const link = document.getElementById('We');
  if (link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      setTimeout(() => {
        window.location.href = href;
      }, 300); // 2 секунды
    });
  }
});
document.addEventListener('DOMContentLoaded', function() {
  const link = document.getElementById('We');
  if (link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  }
});

const corusel = document.querySelector('.Corusel');
const items = corusel.children; // все дочерние элементы (картинки или блоки)
let currentIndex = 0;
const total = items.length;

// Ширина одного элемента (с учётом gap и padding, но упростим: берём ширину первого)
function getItemWidth() {
  // ширина элемента + gap (если gap задан через CSS)
  const first = items[0];
  const style = getComputedStyle(first);
  const width = first.offsetWidth;
  const gap = parseFloat(getComputedStyle(corusel).gap) || 0;
  return width + gap;
}

function goToSlide(index) {
  if (index >= total) {
    // Если конец — мгновенно перематываем к началу (без анимации)
    corusel.scrollLeft = 0;
    currentIndex = 0;
    return;
  }
  const itemWidth = getItemWidth();
  corusel.scrollTo({
    left: index * itemWidth,
    behavior: 'smooth'
  });
  currentIndex = index;
}

// Запускаем автопрокрутку
let interval = setInterval(() => {
  goToSlide(currentIndex + 1);
}, 3000);

// Остановка при наведении (опционально)
corusel.addEventListener('mouseenter', () => clearInterval(interval));
corusel.addEventListener('mouseleave', () => {
  interval = setInterval(() => goToSlide(currentIndex + 1), 2000);
});

// Пересчёт ширины при изменении размера окна (если нужно)
window.addEventListener('resize', () => {
  // ничего не делаем, т.к. ширина пересчитается при следующем вызове goToSlide
});
// Ждём загрузки страницы, затем через 2 секунды прячем экран загрузки
window.addEventListener('load', function() {
  setTimeout(function() {
    const loading = document.getElementById('Loading');
    loading.style.opacity = '0';            // плавное исчезновение
    setTimeout(function() {
      loading.style.display = 'none';       // убираем из потока
      document.body.style.overflow = '';    // возвращаем прокрутку
      document.getElementById('main-content').style.display = 'block'; // показываем контент
    }, 500); // время совпадает с transition (0.5s)
  }, 3000); // имитация загрузки – 2 секунды
});
