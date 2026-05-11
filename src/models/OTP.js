const { Schema, model } = require('mongoose');

const otpSchema = new Schema({
  deviceId: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = model('OTP', otpSchema);
