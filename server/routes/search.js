const express = require('express');
const router = express.Router();
const { unifiedSearch } = require('../controllers/searchController');
const auth = require('../middleware/auth');

router.get('/', auth, unifiedSearch);

module.exports = router;
