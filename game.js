const { Telegraf, Markup, session } = require('telegraf');

// === Настройки ===
const BOT_TOKEN = '8133373573:AAEXj8mS0CNSiFc1v4qMcH8lYdvwUNR1eVA';
const CHANNEL_ID = '@piar_group_chatt'; // например, '@mytaxichannel' или -1001234567890

const bot = new Telegraf(BOT_TOKEN);

// Включаем сессии для хранения состояния заказа
bot.use(session());

// Шаблон фирменного стиля — цвета и эмодзи для сообщений
const TAXI_EMOJI = '🚕';
const STYLE_TITLE = '💛 *Таксопарк "СуперТакси"* 💛\n\n';

// Состояния для диалога
const STATES = {
  START: 'start',
  WAIT_DEST: 'wait_dest',
  WAIT_PASSENGERS: 'wait_passengers',
  WAIT_PHONE: 'wait_phone',
  CONFIRM: 'confirm',
};

// Стартовая команда
bot.start((ctx) => {
  ctx.session.state = STATES.START;
  ctx.session.order = {};
  return ctx.replyWithMarkdown(
    `Добро пожаловать в *СуперТакси*! Нажмите кнопку ниже, чтобы заказать такси.`,
    Markup.keyboard([['🚖 Заказать такси']])
      .oneTime()
      .resize()
  );
});

// Обработка текстовых сообщений в зависимости от состояния
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const state = ctx.session.state;

  if (state === STATES.START && text === '🚖 Заказать такси') {
    ctx.session.state = STATES.WAIT_DEST;
    return ctx.reply(
      'Введите адрес, куда нужно ехать:',
      Markup.removeKeyboard()
    );
  }

  if (state === STATES.WAIT_DEST) {
    ctx.session.order.destination = text.trim();
    ctx.session.state = STATES.WAIT_PASSENGERS;
    return ctx.reply('Сколько человек поедет? Введите число (например, 1, 2, 3):');
  }

  if (state === STATES.WAIT_PASSENGERS) {
    const passengers = parseInt(text);
    if (isNaN(passengers) || passengers <= 0 || passengers > 10) {
      return ctx.reply('Пожалуйста, введите корректное число пассажиров от 1 до 10.');
    }
    ctx.session.order.passengers = passengers;
    ctx.session.state = STATES.WAIT_PHONE;

    return ctx.reply(
      'Укажите ваш номер телефона в формате +7XXXXXXXXXX или 8XXXXXXXXXX:',
      Markup.keyboard([
        Markup.button.contactRequest('Отправить мой номер телефона'),
      ]).oneTime().resize()
    );
  }

  if (state === STATES.WAIT_PHONE) {
    // Если пользователь не отправил контакт, а написал текст
    const phone = text.trim();
    const phoneRegex = /^(\+7|8)\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return ctx.reply(
        'Неверный формат номера. Введите номер в формате +7XXXXXXXXXX или 8XXXXXXXXXX или отправьте контакт через кнопку.'
      );
    }
    ctx.session.order.phone = phone;
    ctx.session.state = STATES.CONFIRM;
    return sendOrderConfirm(ctx);
  }

  if (state === STATES.CONFIRM && (text === '✅ Подтвердить заказ' || text === '❌ Отменить')) {
    if (text === '✅ Подтвердить заказ') {
      await sendOrderToChannel(ctx);
      ctx.session.state = STATES.START;
      ctx.session.order = {};
      return ctx.reply(
        'Спасибо! Ваш заказ принят и отправлен в службу такси.',
        Markup.keyboard([['🚖 Заказать такси']]).resize()
      );
    }
    if (text === '❌ Отменить') {
      ctx.session.state = STATES.START;
      ctx.session.order = {};
      return ctx.reply(
        'Заказ отменён.',
        Markup.keyboard([['🚖 Заказать такси']]).resize()
      );
    }
  }

  // Если ничего не подходит
  return ctx.reply('Пожалуйста, воспользуйтесь кнопкой "Заказать такси".');
});

// Обработка контакта (если пользователь отправляет свой номер)
bot.on('contact', async (ctx) => {
  if (ctx.session.state === STATES.WAIT_PHONE) {
    const phone = ctx.message.contact.phone_number;
    const phoneFormatted = phone.startsWith('+') ? phone : '+7' + phone;
    ctx.session.order.phone = phoneFormatted;
    ctx.session.state = STATES.CONFIRM;
    return sendOrderConfirm(ctx);
  } else {
    return ctx.reply('Чтобы заказать такси, нажмите кнопку "🚖 Заказать такси".');
  }
});

// Функция отправки сообщения с подтверждением заказа
async function sendOrderConfirm(ctx) {
  const order = ctx.session.order;
  const msg = `${TAXI_EMOJI} *Подтвердите заказ:*\n\n` +
    `📍 *Куда:* ${order.destination}\n` +
    `👥 *Пассажиров:* ${order.passengers}\n` +
    `📞 *Телефон:* ${order.phone}\n\n` +
    `Если всё верно, нажмите кнопку ниже.`;
  return ctx.replyWithMarkdown(
    msg,
    Markup.keyboard([['✅ Подтвердить заказ', '❌ Отменить']])
      .oneTime()
      .resize()
  );
}

// Функция отправки заказа в канал/группу
async function sendOrderToChannel(ctx) {
  const order = ctx.session.order;
  const msg = `${TAXI_EMOJI} *Новый заказ такси*\n\n` +
    `📍 *Куда:* ${order.destination}\n` +
    `👥 *Пассажиров:* ${order.passengers}\n` +
    `📞 *Телефон:* ${order.phone}\n\n` +
    `_Заказчик:_ [${ctx.from.first_name}](tg://user?id=${ctx.from.id})`;
  try {
    await ctx.telegram.sendMessage(CHANNEL_ID, msg, { parse_mode: 'Markdown' });
  } catch (e) {
    console.error('Ошибка при отправке заказа в канал:', e);
  }
}

// Запускаем бота
bot.launch();

console.log('Бот запущен.');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));