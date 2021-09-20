const mongoose = require("mongoose");

const ticket = new mongoose.Schema(
  {
    // the user's id
    _id: String,
    channel: String,
  },
  { versionKey: false }
);

module.exports = mongoose.model("ticket", ticket);
