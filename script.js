const pickupInput = document.getElementById('pickup');
const deliveryInput = document.getElementById('delivery');
const passengersInput = document.getElementById('passengers');
const orderBtn = document.getElementById('orderBtn');
const message = document.getElementById('message');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');

let history = [];

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

function loadHistory() {
  const stored = localStorage.getItem('taxiOrderHistory');
  if (stored) {
    try {
      history = JSON.parse(stored);
    } catch {
      history = [];
    }
  }
}

function saveHistory() {
  localStorage.setItem('taxiOrderHistory', JSON.stringify(history));
}

function renderHistory() {
  if (history.length === 0) {
    historySection.classList.remove('show');
    historyList.innerHTML = '';
    return;
  }
  historySection.classList.add('show');

  historyList.innerHTML = history
    .map((item, index) => `
      <li class="history-item">
        <strong>От:</strong> ${escapeHtml(item.pickup)}<br />
        <strong>Куда:</strong> ${escapeHtml(item.delivery)}<br />
        <strong>Пассажиры:</strong> ${escapeHtml(String(item.passengers))}
        <button class="repeat-btn" data-index="${index}">Повторить заказ</button>
      </li>
    `).join('');

  historyList.querySelectorAll('.repeat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-index');
      if (history[idx]) {
        pickupInput.value = history[idx].pickup;
        deliveryInput.value = history[idx].delivery;
        passengersInput.value = history[idx].passengers;
        message.textContent = 'Данные заказа подставлены.';
        message.className = 'success';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

async function sendOrder(pickup, delivery, passengers) {
  const botToken = '7563958637:AAFYZAnO9GnqrV6mDxdzQS8qU3N020KUVlU'; // сюда вставляешь свой токен
  const chatId = '@javascriptprocets'; // сюда вставляешь ID чата или группы
  const text = `🚖 Новый заказ такси:\n\n🗺 Отправление: ${pickup}\n🏁 Доставка: ${delivery}\n👥 Пассажиров: ${passengers}`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    }),
  });

  if (!response.ok) throw new Error(`Ошибка отправки: ${response.status}`);
  return await response.json();
}

orderBtn.addEventListener('click', async () => {
  const pickup = pickupInput.value.trim();
  const delivery = deliveryInput.value.trim();
  const passengers = passengersInput.value.trim();

  if (!pickup || !delivery || !passengers || isNaN(passengers) || Number(passengers) < 1) {
    message.textContent = 'Заполните все поля корректно.';
    message.className = 'error';
    return;
  }

  orderBtn.disabled = true;
  message.textContent = 'Отправка...';
  message.className = '';

  try {
    await sendOrder(pickup, delivery, Number(passengers));

    history.unshift({ pickup, delivery, passengers: Number(passengers) });
    if (history.length > 10) history.pop();
    saveHistory();
    renderHistory();

    message.textContent = 'Заказ отправлен!';
    message.className = 'success';

    pickupInput.value = '';
    deliveryInput.value = '';
    passengersInput.value = '';
  } catch (error) {
    message.textContent = 'Ошибка отправки: ' + error.message;
    message.className = 'error';
  } finally {
    orderBtn.disabled = false;
  }
});

loadHistory();
renderHistory();