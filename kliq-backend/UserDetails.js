const mongoose = require('mongoose');

// User schema with consistent naming
const UserDetailSchema = new mongoose.Schema(
  {
    name: String,
    mobilePhone: { type: String, required: true, unique: true }, // Changed from 'num' to 'mobilePhone'
    password: String,
  },
  {
    collection: 'UserInfo',
  }
);

const UserInfo = mongoose.model('UserInfo', UserDetailSchema);

module.exports = UserInfo;
