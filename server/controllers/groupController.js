const Group = require('../models/Group');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

exports.createGroup = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const groupData = {
      name,
      description: description || '',
      creator: req.userId,
      members: [req.userId],
      isPublic: isPublic !== undefined ? isPublic : true
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'groot1/groups');
      groupData.image = {
        public_id: result.public_id,
        url: result.url
      };
      fs.unlinkSync(req.file.path);
    }

    const group = new Group(groupData);
    await group.save();

    // Add group to all members' User documents
    await User.updateMany(
      { _id: { $in: groupData.members } },
      { $addToSet: { groups: group._id } }
    );

    // Also populate members for the response
    await group.populate('creator', 'username email image');
    await group.populate('members', 'username email image');

    res.status(201).json({ message: 'Group created successfully', group });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, isPublic } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can update' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (isPublic !== undefined) group.isPublic = isPublic;

    if (req.file) {
      if (group.image.public_id) {
        await deleteFromCloudinary(group.image.public_id);
      }

      const result = await uploadToCloudinary(req.file.path, 'groot1/groups');
      group.image = {
        public_id: result.public_id,
        url: result.url
      };
      fs.unlinkSync(req.file.path);
    }

    await group.save();

    res.json({ message: 'Group updated successfully', group });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('creator', 'username email image')
      .populate('members', 'username email image');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.userId })
      .populate('creator', 'username email image')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
