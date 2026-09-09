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
  // Проверяем, что WebApp доступен
  if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
    console.warn('Telegram WebApp не загружен');
    return;
  }

  // Получаем элементы
  const payButton = document.getElementById('pay-button');
  const starsInput = document.getElementById('stars-input');
  const resultDiv = document.getElementById('result-message');

  // Получаем данные пользователя (для красоты)
  const user = Telegram.WebApp.initDataUnsafe?.user;
  if (user && user.photo_url) {
    const avatarImg = document.getElementById('avatar-img');
    avatarImg.src = user.photo_url;
  }

  // Обработчик клика по кнопке
  payButton.addEventListener('click', function() {
    const amount = parseInt(starsInput.value, 10);

    // Проверяем корректность суммы
    if (isNaN(amount) || amount < 1) {
      Telegram.WebApp.showAlert('Пожалуйста, введите корректное количество звёзд (минимум 1).');
      return;
    }

    // Блокируем кнопку на время обработки
    payButton.disabled = true;
    resultDiv.textContent = '⏳ Обработка...';

    // Симулируем запрос к серверу (в реальном проекте здесь будет создание инвойса)
    setTimeout(() => {
      // Вариант 1: показать подтверждение через встроенное окно
      Telegram.WebApp.showPopup({
        title: 'Подтверждение оплаты',
        message: `Вы собираетесь оплатить ${amount} звёзд. Продолжить?`,
        buttons: [
          { id: 'yes', type: 'default', text: 'Оплатить' },
          { id: 'cancel', type: 'destructive', text: 'Отмена' }
        ]
      }, function(buttonId) {
        if (buttonId === 'yes') {
          // Здесь в реальном проекте нужно вызвать Telegram.WebApp.openInvoice(slug)
          // и обработать результат.
          // Для демонстрации просто покажем успешный попап.
          Telegram.WebApp.showAlert(`✅ Оплата ${amount} звёзд успешно выполнена!`);
          resultDiv.textContent = `✅ Оплачено ${amount} звёзд`;
          // Можно отправить событие на сервер через sendData
          // Telegram.WebApp.sendData(JSON.stringify({ action: 'pay', stars: amount }));
        } else {
          resultDiv.textContent = '❌ Оплата отменена';
        }
        payButton.disabled = false;
      });
    }, 500); // имитация задержки

    // Альтернативно, если хочешь просто показать alert:
    /*
    Telegram.WebApp.showAlert(`Оплата ${amount} звёзд завершена!`);
    resultDiv.textContent = `✅ Оплачено ${amount} звёзд`;
    payButton.disabled = false;
    */
  });

  // Сообщаем Telegram, что приложение готово
  Telegram.WebApp.ready();
});
