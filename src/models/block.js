const mongoose = require("mongoose");

const block = new mongoose.Schema(
  {
    // the user's id
    _id: String,
    reason: String,
  },
  { versionKey: false }
);

module.exports = mongoose.model("block", block);
