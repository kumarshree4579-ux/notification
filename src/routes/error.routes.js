const router = require('express').Router();
const { getErrors } = require('../controllers/error.controller');

router.get('/', getErrors);

module.exports = router;
