const { Schema, model } = require('mongoose');

const notificationSchema = new Schema({
  packageName: String,
  title: String,
  text: String,
  timestamp: Number,
  deviceId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Notification', notificationSchema);
