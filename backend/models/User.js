const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Local auth (optional if Google user)
    passwordHash: { type: String },

    // Google auth
    googleId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
