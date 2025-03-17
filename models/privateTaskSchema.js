const mongoose = require("mongoose");
const { type } = require("os");

const privateTaskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // Duration in hours
    required: true,
  },
  dependencies: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "GlobalTask" },
      name: { type: String },
    },
  ],
  timing: {
    // Timing related to the event date
    type: String, // 'before' or 'after'
    enum: ["before", "after"],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("PrivateTask", privateTaskSchema);
