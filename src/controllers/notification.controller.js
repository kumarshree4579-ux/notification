const Notification = require('../models/Notification');
const bot = require('../bot/bot');
const { saveFailedPayload } = require('../middleware/validatePayload');

const escMd = (str) => String(str ?? '').replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');

const createNotification = async (req, res) => {
  try {
    const { deviceId, packageName, title, text, timestamp } = req.body;
    await Notification.create({ deviceId, packageName, title, text, timestamp });

    const message = `📱 *${escMd(packageName)}*
📌 ${escMd(title)}
💬 ${escMd(text)}
🕐 ${escMd(new Date(timestamp).toLocaleString())}`;

    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
    res.json({ success: true });
  } catch (e) {
    await saveFailedPayload(req, e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

const getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { createNotification, getNotification };
