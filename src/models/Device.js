const { Schema, model } = require('mongoose');

const deviceSchema = new Schema({
  deviceId: { type: String, required: true, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Device', deviceSchema);
