const router = require('express').Router();
const { createNotification, getNotification } = require('../controllers/notification.controller');

router.post('/', createNotification);
router.get('/',getNotification)

module.exports = router;
