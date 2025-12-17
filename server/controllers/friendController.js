const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

exports.sendFriendRequest = async (req, res) => {
  try {
    const { toUserId } = req.body;

    if (req.userId === toUserId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: req.userId, to: toUserId },
        { from: toUserId, to: req.userId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const friendRequest = new FriendRequest({
      from: req.userId,
      to: toUserId
    });

    await friendRequest.save();
    await friendRequest.populate('from', 'username email image');

    res.status(201).json({ message: 'Friend request sent', friendRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.respondToFriendRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.to.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    friendRequest.status = action;
    await friendRequest.save();

    if (action === 'accepted') {
      await User.findByIdAndUpdate(friendRequest.from, {
        $addToSet: { friends: friendRequest.to }
      });
      await User.findByIdAndUpdate(friendRequest.to, {
        $addToSet: { friends: friendRequest.from }
      });
    }

    res.json({ message: `Friend request ${action}`, friendRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      to: req.userId,
      status: 'pending'
    })
    .populate('from', 'username email image')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      from: req.userId,
      status: 'pending'
    })
    .populate('to', 'username email image')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
