const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
    },
    isDelete: {
        type: Boolean,
        default:false
    },
    user: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User", // Reference to the User model
       required: true,
     },
  tasks: [
    {
      task: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "taskType", // Use the correct reference based on taskType
      },
      taskType: {
        type: String,
        enum: ["GlobalTask", "PrivateTask"], // Type of task
        required: true,
      },
      customDuration: { type: Number }, // Override duration if necessary
      customTiming: { type: String }, // Override timing (before or after)
      customDependencies: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
      ], // Custom task dependencies
    },
  ],
});

module.exports = mongoose.model("Event", eventSchema);
