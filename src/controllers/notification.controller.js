const Notification = require('../models/Notification');
const bot = require('../bot/bot');

const createNotification = async (req, res) => {
  const { deviceId, packageName, title, text, timestamp } = req.body;
  await Notification.create({ deviceId, packageName, title, text, timestamp });

  const message = `📱 *${packageName}*
📌 ${title}
💬 ${text}
🕐 ${new Date(timestamp * 1000).toLocaleString()}`;

  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });

  res.json({ success: true });
};

const getNotification = async (req, res) => {
  const notifications = await Notification.find().sort({ timestamp: -1 });
  res.json(notifications);
};

module.exports = { createNotification, getNotification };
