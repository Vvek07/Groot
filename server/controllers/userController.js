const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

exports.updateProfile = async (req, res) => {
  try {
    const { bio } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (user.image.public_id) {
        await deleteFromCloudinary(user.image.public_id);
      }

      // Upload new image
      const result = await uploadToCloudinary(req.file.path, 'groot1/profiles');
      user.image = {
        public_id: result.public_id,
        url: result.url
      };

      // Delete local file
      fs.unlinkSync(req.file.path);
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('friends', 'username email image')
      .populate('groups', 'name description image');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
