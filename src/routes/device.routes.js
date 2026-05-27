const router = require('express').Router();
const Notification = require('../models/Notification');
const Device = require('../models/Device');

router.delete('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    await Promise.all([
      Notification.deleteMany({ deviceId }),
      Device.deleteOne({ deviceId }),
    ]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
