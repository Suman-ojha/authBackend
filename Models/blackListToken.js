const mongoose = require("mongoose");

// Define the user schema
const blackLsistTokenSchema = new mongoose.Schema(
  {
    token:{type:String}
  },
  { timestamps: true }
);

// Create and export the User model
const User = mongoose.model("black_list_tokens", blackLsistTokenSchema);
module.exports = User;
