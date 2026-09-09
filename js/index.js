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
