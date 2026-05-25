const FailedPayload = require('../models/FailedPayload');

const requiredFields = {
  'POST /api/notifications':     ['deviceId', 'packageName', 'title', 'text', 'timestamp'],
  'POST /api/auth/request-otp':  ['deviceId', 'reason'],
  'POST /api/auth/verify-otp':   ['deviceId', 'otp', 'newPassword'],
};

const saveFailedPayload = (req, reason) =>
  FailedPayload.create({
    route: `${req.method} ${req.baseUrl}${req.path === '/' ? '' : req.path}`,
    method: req.method,
    payload: req.body,
    reason,
  }).catch(() => {});

const validatePayload = async (req, res, next) => {
  const key = `${req.method} ${req.baseUrl}${req.path === '/' ? '' : req.path}`;
  const fields = requiredFields[key];

  if (!fields) return next();

  // For notifications: skip field validation if it's a batch payload
  if (key === 'POST /api/notifications') {
    const isBatch = Array.isArray(req.body) || Array.isArray(req.body?.items);
    if (isBatch) return next();
  }

  const missing = fields.filter(f => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');
  if (missing.length) {
    await saveFailedPayload(req, `Missing fields: ${missing.join(', ')}`);
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  }

  next();
};

module.exports = { validatePayload, saveFailedPayload };
