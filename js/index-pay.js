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
  if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
    console.warn('Telegram WebApp не загружен');
    return;
  }

  const payButton = document.getElementById('pay-button');
  const starsInput = document.getElementById('stars-input');
  const resultDiv = document.getElementById('result-message');
  const balanceSpan = document.getElementById('balance-value');

  // Получаем данные пользователя
  const user = Telegram.WebApp.initDataUnsafe?.user;
  const userId = user?.id;

  // Загружаем баланс из localStorage (в реальном проекте — с сервера)
  let currentBalance = parseInt(localStorage.getItem('userBalance') || '0');
  balanceSpan.textContent = currentBalance;

  // Аватарка
  if (user && user.photo_url) {
    document.getElementById('avatar-img').src = user.photo_url;
  }

  payButton.addEventListener('click', async function() {
    const starsAmount = parseInt(starsInput.value, 10);
    
    if (isNaN(starsAmount) || starsAmount < 1) {
      Telegram.WebApp.showAlert('Введите корректное количество звёзд (минимум 1).');
      return;
    }

    if (!userId) {
      Telegram.WebApp.showAlert('Ошибка: пользователь не авторизован.');
      return;
    }

    payButton.disabled = true;
    resultDiv.textContent = '⏳ Создание счёта...';

    try {
      // 1. Запрашиваем ссылку на инвойс у сервера
      const response = await fetch('https://ваш-сервер.com/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          stars_amount: starsAmount
        })
      });
      
      const data = await response.json();
      
      if (!data.invoiceLink) {
        throw new Error('Не удалось создать счёт');
      }

      resultDiv.textContent = '⏳ Ожидание оплаты...';

      // 2. Открываем инвойс в Telegram
      Telegram.WebApp.openInvoice(data.invoiceLink, function(status) {
        if (status === 'paid') {
          // Платёж успешен — обновляем баланс
          currentBalance += starsAmount;
          localStorage.setItem('userBalance', String(currentBalance));
          balanceSpan.textContent = currentBalance;
          resultDiv.textContent = `✅ Баланс пополнен на ${starsAmount} ⭐`;
        } else if (status === 'failed') {
          resultDiv.textContent = '❌ Ошибка при оплате';
        } else if (status === 'cancelled') {
          resultDiv.textContent = '❌ Оплата отменена';
        } else {
          resultDiv.textContent = '❌ Неизвестный статус';
        }
        payButton.disabled = false;
      });

    } catch (error) {
      Telegram.WebApp.showAlert('Ошибка: ' + error.message);
      resultDiv.textContent = '❌ Ошибка при создании счёта';
      payButton.disabled = false;
    }
  });

  Telegram.WebApp.ready();
});
