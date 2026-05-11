const router = require('express').Router();
const { requestOtp, verifyOtp } = require('../controllers/auth.controller');

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;
