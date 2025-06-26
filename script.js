const pickupInput = document.getElementById('pickup');
const deliveryInput = document.getElementById('delivery');
const passengersInput = document.getElementById('passengers');
const orderBtn = document.getElementById('orderBtn');
const message = document.getElementById('message');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');

let history = [];

// Безопасный вывод текста
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// Загрузка истории из localStorage
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

// Сохранение истории в localStorage
function saveHistory() {
  localStorage.setItem('taxiOrderHistory', JSON.stringify(history));
}

// Отрисовка истории на странице
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
        message.textContent = 'Данные заказа подставлены. Можно повторить заказ.';
        message.className = 'success';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// Отправка заказа через fetch (пример отправки в телеграм-бота)
async function sendOrder(pickup, delivery, passengers) {
  const url = 'https://example.com/your-endpoint'; // Твой URL куда отправлять
  const body = {
    pickup,
    delivery,
    passengers,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

orderBtn.addEventListener('click', async () => {
  const pickup = pickupInput.value.trim();
  const delivery = deliveryInput.value.trim();
  const passengers = passengersInput.value.trim();

  if (!pickup || !delivery || !passengers || isNaN(passengers) || Number(passengers) < 1) {
    message.textContent = 'Пожалуйста, заполните все поля корректно.';
    message.className = 'error';
    return;
  }

  orderBtn.disabled = true;
  message.textContent = 'Отправка заказа...';
  message.className = '';

  try {
    await sendOrder(pickup, delivery, Number(passengers));
    // Сохраняем заказ в историю
    history.unshift({ pickup, delivery, passengers: Number(passengers) });
    if (history.length > 10) history.pop();
    saveHistory();
    renderHistory();

    message.textContent = 'Заказ успешно отправлен! Спасибо.';
    message.className = 'success';

    pickupInput.value = '';
    deliveryInput.value = '';
    passengersInput.value = '';
  } catch (error) {
    message.textContent = 'Ошибка при отправке заказа: ' + error.message;
    message.className = 'error';
  } finally {
    orderBtn.disabled = false;
  }
});

// Инициализация
loadHistory();
renderHistory();
