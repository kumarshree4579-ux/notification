const bcrypt = require('bcryptjs');
const Device = require('../models/Device');
const OTP = require('../models/OTP');
const Notification = require('../models/Notification');
const bot = require('../bot/bot');
const { saveFailedPayload } = require('../middleware/validatePayload');

const escMd = (str) => String(str ?? '').replace(/[_*`[]/g, '\\$&');

const requestOtp = async (req, res) => {
  try {
    const { deviceId, reason } = req.body;
    const device = await Device.findOne({ deviceId });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.deleteMany({ deviceId });
    await OTP.create({ deviceId, otp, expiresAt });

    await Notification.create({
      deviceId,
      packageName: 'com.auth.otp',
      title: 'Your OTP Code',
      text: `Your OTP is: ${otp}. Reason: ${reason}. Expires in 5 minutes.`,
      timestamp: Date.now()
    });

    // Send Telegram without blocking response
    bot.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      `🔐 *OTP Request*\n📱 Device: \`${escMd(deviceId)}\`\n🔑 OTP: *${otp}*\n📋 Reason: ${escMd(reason)}`,
      { parse_mode: 'Markdown' }
    ).catch(() => {});

    res.json({ success: true, message: 'OTP sent to device' });
  } catch (e) {
    await saveFailedPayload(req, e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { deviceId, otp, newPassword } = req.body;
    const record = await OTP.findOne({ deviceId, otp });
    if (!record) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await Device.findOneAndUpdate({ deviceId }, { password: hashed }, { upsert: true });
    await OTP.deleteOne({ _id: record._id });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (e) {
    await saveFailedPayload(req, e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { requestOtp, verifyOtp };
