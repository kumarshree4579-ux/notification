const FailedPayload = require('../models/FailedPayload');

const getErrors = async (req, res) => {
  try {
    const errors = await FailedPayload.find().sort({ createdAt: -1 });
    res.json(errors);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { getErrors };
