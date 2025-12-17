const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  image: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
