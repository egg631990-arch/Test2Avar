<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const balanceSpan = document.getElementById('balance-value');
    if (balanceSpan) {
      // Читаем баланс из localStorage
      const balance = parseInt(localStorage.getItem('userBalance') || '0');
      balanceSpan.textContent = balance;

      // Аватарка (если есть контейнер)
      const avatarImg = document.getElementById('avatar-img');
      if (avatarImg && typeof Telegram !== 'undefined' && Telegram.WebApp) {
        const user = Telegram.WebApp.initDataUnsafe?.user;
        if (user?.photo_url) {
          avatarImg.src = user.photo_url;
        }
      }
      if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        Telegram.WebApp.ready();
      }
    }
  });
</script>
