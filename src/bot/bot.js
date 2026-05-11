const TelegramBot = require('node-telegram-bot-api');
const Notification = require('../models/Notification');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    'Welcome! Available commands:\n/notifications - View latest 10 notifications'
  );
});

bot.onText(/\/notifications/, async (msg) => {
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(10);

  if (!notifications.length) {
    return bot.sendMessage(msg.chat.id, 'No notifications found.');
  }

  const text = notifications.map((n, i) =>
    `*${i + 1}. ${n.packageName}*\n📌 ${n.title}\n💬 ${n.text}\n🕐 ${new Date(n.timestamp * 1000).toLocaleString()}`
  ).join('\n\n');

  bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

module.exports = bot;
