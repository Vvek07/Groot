const express = require('express');
const router = express.Router();
const { updateProfile, getUserProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../utils/multer');

router.put('/profile', auth, upload.single('image'), updateProfile);
router.get('/:userId', auth, getUserProfile);

module.exports = router;
