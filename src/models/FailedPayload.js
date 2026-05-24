const { Schema, model } = require('mongoose');

const failedPayloadSchema = new Schema({
  route: String,
  method: String,
  payload: Schema.Types.Mixed,
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('FailedPayload', failedPayloadSchema);
