const { Telegraf } = require('telegraf');

const BOT_TOKEN = '8133373573:AAEXj8mS0CNSiFc1v4qMcH8lYdvwUNR1eVA';
const WEB_APP_URL = 'https://findly-bird-git-main-baxtiyor-sheraliyevs-projects.vercel.app/'; // размести index.html на своём сервере
const CHANNEL_ID = '@piar_group_chatt';

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('🚖 Нажмите кнопку ниже, чтобы заказать такси:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚕 Заказать Такси', web_app: { url: WEB_APP_URL } }]
      ]
    }
  });
});

bot.on('web_app_data', (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data);
    const msg = `
🚖 *Новый заказ такси*\n
📍 *Куда:* ${data.destination}
👥 *Пассажиров:* ${data.passengers}
📞 *Телефон:* ${data.phone}
_Заказчик:_ [${ctx.from.first_name}](tg://user?id=${ctx.from.id})
    `;
    ctx.telegram.sendMessage(CHANNEL_ID, msg, { parse_mode: 'Markdown' });
    ctx.reply('✅ Ваш заказ успешно отправлен! Спасибо!');
  } catch (e) {
    console.error('Ошибка обработки данных:', e);
    ctx.reply('❌ Произошла ошибка, попробуйте ещё раз.');
  }
});

bot.launch();
console.log('Бот запущен...');