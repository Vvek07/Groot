const GroupRequest = require('../models/GroupRequest');
const Group = require('../models/Group');

exports.sendGroupRequest = async (req, res) => {
  try {
    const { groupId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.includes(req.userId)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    const existingRequest = await GroupRequest.findOne({
      user: req.userId,
      group: groupId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const groupRequest = new GroupRequest({
      user: req.userId,
      group: groupId
    });

    await groupRequest.save();
    await groupRequest.populate('user', 'username email image');
    await groupRequest.populate('group', 'name description image');

    res.status(201).json({ message: 'Group join request sent', groupRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.respondToGroupRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    const groupRequest = await GroupRequest.findById(requestId).populate('group');

    if (!groupRequest) {
      return res.status(404).json({ message: 'Group request not found' });
    }

    if (groupRequest.group.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can respond' });
    }

    groupRequest.status = action;
    await groupRequest.save();

    if (action === 'accepted') {
      await Group.findByIdAndUpdate(groupRequest.group._id, {
        $addToSet: { members: groupRequest.user }
      });
    }

    res.json({ message: `Group request ${action}`, groupRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getGroupRequests = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only group creator can view requests' });
    }

    const requests = await GroupRequest.find({
      group: groupId,
      status: 'pending'
    })
    .populate('user', 'username email image')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyGroupRequests = async (req, res) => {
  try {
    const requests = await GroupRequest.find({
      user: req.userId,
      status: 'pending'
    })
    .populate('group', 'name description image creator')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
