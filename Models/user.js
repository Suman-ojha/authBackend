const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String },
    phone: { type: String },
    photo: {
      type: "String",
      default:
        "https://tse3.mm.bing.net/th?id=OIP.eyhIau9Wqaz8_VhUIomLWgHaHa&pid=Api&P=0",
    },
    isAdmin: { type: Boolean, default: false },
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

// Create and export the User model
const User = mongoose.model("users", userSchema);
module.exports = User;
