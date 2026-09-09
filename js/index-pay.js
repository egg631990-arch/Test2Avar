document.addEventListener('DOMContentLoaded', function() {
  if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
    console.warn('Telegram WebApp не загружен');
    return;
  }

  const SERVER_URL = 'https://telegcas.onrender.com'; // ← твой сервер

  const payButton = document.getElementById('pay-button');
  const starsInput = document.getElementById('stars-input');
  const resultDiv = document.getElementById('result-message');
  const balanceSpan = document.getElementById('balance-value');

  const user = Telegram.WebApp.initDataUnsafe?.user;
  const userId = user?.id;

  let currentBalance = parseInt(localStorage.getItem('userBalance') || '0');
  balanceSpan.textContent = currentBalance;

  // Аватарка
  const avatarImg = document.getElementById('avatar-img');
  if (user && user.photo_url) {
    avatarImg.src = user.photo_url;
  } else if (user) {
    avatarImg.src = 'https://via.placeholder.com/100/cccccc/666666?text=' + (user.first_name ? user.first_name[0] : '?');
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
