document.addEventListener('DOMContentLoaded', function() {
  if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
    console.warn('Telegram WebApp не загружен');
    return;
  }

  const SERVER_URL = 'https://telegcas.onrender.com';

  const payButton = document.getElementById('pay-button');
  const starsInput = document.getElementById('stars-input');
  const resultDiv = document.getElementById('result-message');

  const user = Telegram.WebApp.initDataUnsafe?.user;
  const userId = user?.id;

  // ===== Аватарка =====
  const avatarImg = document.getElementById('avatar-img');
  if (avatarImg) {
    if (user && user.photo_url) {
      avatarImg.src = user.photo_url;
    } else if (user) {
      const firstName = user.first_name || '?';
      avatarImg.src = 'https://via.placeholder.com/80/cccccc/666666?text=' + firstName[0];
    }
  }

  // ===== Ник =====
  const userNameDiv = document.getElementById('user-name');
  if (userNameDiv && user) {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const username = user.username ? ' (@' + user.username + ')' : '';
    userNameDiv.textContent = (firstName + ' ' + lastName).trim() + username;
  }

  // ===== Кнопка оплаты =====
  payButton.addEventListener('click', async function() {
    const starsAmount = parseInt(starsInput.value, 10);

    if (isNaN(starsAmount) || starsAmount < 10) {
      Telegram.WebApp.showAlert('Минимальная сумма пополнения — 10 звёзд.');
      return;
    }

    if (!userId) {
      Telegram.WebApp.showAlert('Ошибка: пользователь не авторизован.');
      return;
    }

    payButton.disabled = true;
    resultDiv.textContent = '⏳ Создание счёта...';

    try {
      const response = await fetch(`${SERVER_URL}/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, stars_amount: starsAmount })
      });
      const data = await response.json();
      if (!data.invoiceLink) throw new Error('Не удалось создать счёт');

      resultDiv.textContent = '⏳ Ожидание оплаты...';

      Telegram.WebApp.openInvoice(data.invoiceLink, function(status) {
        if (status === 'paid') {
          // Обновляем баланс в CloudStorage — его прочитает index.html
          Telegram.WebApp.CloudStorage.getItem('userBalance', (err, value) => {
            let currentBalance = parseInt(value || '0', 10);
            currentBalance += starsAmount;
            Telegram.WebApp.CloudStorage.setItem('userBalance', String(currentBalance), (err) => {
              if (err) console.error('Ошибка сохранения баланса:', err);
            });
          });
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