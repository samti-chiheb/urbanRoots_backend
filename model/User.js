const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    roles: {
      user: {
        type: Number,
        default: 9009,
      },
      gardener: {
        type: Number,
        default: null,
      },
      admin: {
        type: Number,
        default: null,
      },
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String, 
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    socialLinks: {
      twitter: {
        type: String,
        default: null,
      },
      facebook: {
        type: String,
        default: null,
      },
      instagram: {
        type: String,
        default: null,
      },
      linkedin: {
        type: String,
        default: null,
      },
    },
    website: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);