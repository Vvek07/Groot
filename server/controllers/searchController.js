const User = require('../models/User');
const Group = require('../models/Group');

exports.unifiedSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.json({ users: [], groups: [] });
    }

    const searchRegex = new RegExp(query, 'i');

    // Parallel search using Promise.all
    const [users, groups] = await Promise.all([
      User.find({
        $and: [
          { _id: { $ne: req.userId } },
          {
            $or: [
              { username: searchRegex },
              { email: searchRegex }
            ]
          }
        ]
      })
      .select('username email bio image')
      .limit(10),

      Group.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      })
      .populate('creator', 'username')
      .select('name description image creator members isPublic')
      .limit(10)
    ]);

    res.json({ users, groups });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
