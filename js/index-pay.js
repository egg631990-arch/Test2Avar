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

  const avatarImg = document.getElementById('avatar-img');
  if (user && user.photo_url && avatarImg) {
    avatarImg.src = user.photo_url;
  }

  payButton.addEventListener('click', async function() {
    const starsAmount = parseInt(starsInput.value, 10);

    // ✅ Проверка минимальной суммы
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
          // ✅ Читаем текущий баланс из CloudStorage и обновляем
          Telegram.WebApp.CloudStorage.getItem('userBalance', (err, value) => {
            if (err) {
              console.error('Ошибка чтения баланса:', err);
              // Если ошибка — начинаем с 0
              value = '0';
            }
            let currentBalance = parseInt(value || '0', 10);
            currentBalance += starsAmount;

            // Сохраняем новый баланс
            Telegram.WebApp.CloudStorage.setItem('userBalance', String(currentBalance), (err) => {
              if (err) {
                console.error('Ошибка сохранения баланса:', err);
                resultDiv.textContent = '⚠️ Оплата прошла, но баланс не сохранился';
                return;
              }
              resultDiv.textContent = `✅ Баланс пополнен на ${starsAmount} ⭐`;
              // Опционально: закрыть Mini App, чтобы вернуться на index.html
              // Telegram.WebApp.close();
            });
          });
        } else if (status === 'failed') {
          resultDiv.textContent = '❌ Ошибка при оплате';
        } else if (status === 'cancelled') {
          resultDiv.textContent = '❌ Оплата отменена';
        } else {
          resultDiv.textContent = '❌ Неизвестный статус: ' + status;
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
