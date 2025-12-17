const express = require('express');
const router = express.Router();
const {
  createGroup,
  updateGroup,
  getGroup,
  getUserGroups
} = require('../controllers/groupController');
const auth = require('../middleware/auth');
const upload = require('../utils/multer');

router.post('/', auth, upload.single('image'), createGroup);
router.put('/:groupId', auth, upload.single('image'), updateGroup);
router.get('/:groupId', auth, getGroup);
router.get('/user/my-groups', auth, getUserGroups);

module.exports = router;
