const Notification = require('../models/Notification');
const bot = require('../bot/bot');
const { saveFailedPayload } = require('../middleware/validatePayload');

const escMd = (str) => String(str ?? '').replace(/[_*`[]/g, '\\$&');

const createNotification = async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body
      : Array.isArray(req.body.items) ? req.body.items
      : [req.body];

    if (items.length === 0) return res.status(400).json({ success: false, message: 'Empty payload' });

    await Notification.insertMany(
      items.map(({ deviceId, packageName, title, text, timestamp }) => ({
        deviceId, packageName, title, text, timestamp
      }))
    );

    if (items.length === 1) {
      const { packageName, title, text, timestamp } = items[0];
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID,
        `📱 *${escMd(packageName)}*\n📌 ${escMd(title)}\n💬 ${escMd(text)}\n🕐 ${escMd(new Date(timestamp).toLocaleString())}`,
        { parse_mode: 'Markdown' }
      ).catch(() => {});
    } else {
      const lines = items.map(({ packageName, title, text, timestamp }) =>
        `📱 *${escMd(packageName)}* | ${escMd(title)}\n💬 ${escMd(text)}\n🕐 ${escMd(new Date(timestamp).toLocaleString())}`
      ).join('\n\n');
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID,
        `📦 *Batch: ${items.length} items*\n\n${lines}`,
        { parse_mode: 'Markdown' }
      ).catch(() => {});
    }

    res.json({ success: true, saved: items.length });
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
