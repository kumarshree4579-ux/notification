const bcrypt = require('bcryptjs');
const Device = require('../models/Device');
const OTP = require('../models/OTP');
const Notification = require('../models/Notification');
const bot = require('../bot/bot');

const requestOtp = async (req, res) => {
  const { deviceId, reason } = req.body;

  const device = await Device.findOne({ deviceId });
  if (!device) return res.status(404).json({ success: false, message: 'Device not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTP.deleteMany({ deviceId }); // clear old OTPs
  await OTP.create({ deviceId, otp, expiresAt });

  // Send OTP as a notification to the device via Telegram
  await Notification.create({
    deviceId,
    packageName: 'com.auth.otp',
    title: 'Your OTP Code',
    text: `Your OTP is: ${otp}. Reason: ${reason}. Expires in 5 minutes.`,
    timestamp: Math.floor(Date.now() / 1000)
  });

  const message = `🔐 *OTP Request*\n📱 Device: \`${deviceId}\`\n🔑 OTP: *${otp}*\n📋 Reason: ${reason}`;
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });

  res.json({ success: true, message: 'OTP sent to device' });
};

const verifyOtp = async (req, res) => {
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
};

module.exports = { requestOtp, verifyOtp };
