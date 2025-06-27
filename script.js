// ВСТАВЬ сюда свои реальные значения
const BOT_TOKEN = 'ВАШ_ТЕЛЕГРАМ_БОТ_ТОКЕН';
const CHAT_ID = 'ВАШ_CHAT_ID';

const form = document.getElementById('orderForm');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const from = form.from.value.trim();
  const to = form.to.value.trim();
  const phonePattern = /^\+?\d{10,15}$/;

  if (!phonePattern.test(phone)) {
    alert('Пожалуйста, введите корректный номер телефона (пример: +79991234567)');
    form.phone.focus();
    return;
  }

  const message = `🚕 Новый заказ такси!\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n📍 Откуда: ${from}\n📍 Куда: ${to}`;

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      form.style.display = 'none';
      successMsg.style.display = 'block';
    } else {
      alert('Ошибка отправки: ' + data.description);
    }
  })
  .catch(err => {
    alert('Сетевая ошибка: ' + err);
  });
});