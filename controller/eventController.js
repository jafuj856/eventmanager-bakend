const Event = require("../models/eventSchema");
const GlobalTask = require("../models/globalTaskSchema");
const PrivateTask = require("../models/privateTaskSchema");
const mongoose = require("mongoose");
const {
  calculateTaskExecutionOrder,
  calculateTotalTime,
  calculateTaskDates,
} = require("../utils/utilityFunctions");

// Create an event and assign tasks
exports.createEvent = async (req, res) => {
    //   Check if user is authenticated
    const { name, description, eventDate, user, tasks = [] } = req.body;
 
    
 if (!user ) {
   return res.status(400).json({ message: "User is not authenticated" });
 }
  // Check if tasks is an array
  if (!Array.isArray(tasks)) {
    return res.status(400).json({ message: "'tasks' should be an array" });
  }

  // Validate task IDs for both global and private tasks
  const taskIds = tasks.map((t) => t.task).filter((task) => task); // Only include tasks with a valid `task` field
  const globalTaskIds = tasks
    .filter((t) => t.taskType === "GlobalTask" && t.task) // Ensure `task` exists for GlobalTask
    .map((t) => t.task);
  const privateTaskIds = tasks
    .filter((t) => t.taskType === "PrivateTask" && t.task) // Ensure `task` exists for PrivateTask
    .map((t) => t.task);

  // Fetch Global and Private Tasks from the database
  const globalTasks = await GlobalTask.find({ _id: { $in: globalTaskIds } });
 const privateTasks = await PrivateTask.find({
   _id: { $in: privateTaskIds },
   user: new mongoose.Types.ObjectId(user), // Convert user to ObjectId
 });

  if (
    globalTasks.length !== globalTaskIds.length ||
    privateTasks.length !== privateTaskIds.length
  ) {
    return res.status(400).json({ message: "One or more tasks are invalid." });
  }

  // Create the event
  const event = new Event({
    name,
      description,
    user,
    eventDate,
    tasks, // List of tasks with their custom settings (duration, timing, dependencies)
  });

  try {
    await event.save();

    // Calculate task execution order and times
    const taskExecutionOrder = calculateTaskExecutionOrder([
      ...globalTasks,
      ...privateTasks,
    ]);
    const totalTime = calculateTotalTime(taskExecutionOrder);
    const taskDates = calculateTaskDates(taskExecutionOrder, eventDate);

    // Send the response with task scheduling results
    res.status(201).json({
      event,
      taskExecutionOrder,
      totalTime,
      taskDates,
      planStartDate: taskDates[0]?.scheduledDate,
      planEndDate: taskDates[taskDates.length - 1]?.scheduledDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Update Event and Tasks
exports.updateEvent = async (req, res) => {
  const { eventId, name, description, eventDate, tasks } = req.body;

  try {
    // Fetch the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Validate task IDs for both global and private tasks
    const taskIds = tasks.map((t) => t.task);
    const globalTaskIds = tasks
      .filter((t) => t.taskType === "GlobalTask")
      .map((t) => t.task);
    const privateTaskIds = tasks
      .filter((t) => t.taskType === "PrivateTask")
      .map((t) => t.task);

    // Fetch Global and Private Tasks from the database
    const globalTasks = await GlobalTask.find({ _id: { $in: globalTaskIds } });
    const privateTasks = await PrivateTask.find({
      _id: { $in: privateTaskIds, user: user },
    });

    if (
      globalTasks.length !== globalTaskIds.length ||
      privateTasks.length !== privateTaskIds.length
    ) {
      return res
        .status(400)
        .json({ message: "One or more tasks are invalid." });
    }

    // Update the event's properties
    event.name = name || event.name;
    event.description = description || event.description;
    event.eventDate = eventDate || event.eventDate;
    event.tasks = tasks || event.tasks;

    // Save the updated event
    await event.save();

    // Calculate task execution order and times
    const taskExecutionOrder = calculateTaskExecutionOrder([
      ...globalTasks,
      ...privateTasks,
    ]);
    const totalTime = calculateTotalTime(taskExecutionOrder);
    const taskDates = calculateTaskDates(taskExecutionOrder, eventDate);

    res.status(200).json({
      event,
      taskExecutionOrder,
      totalTime,
      taskDates,
      planStartDate: taskDates[0]?.scheduledDate,
      planEndDate: taskDates[taskDates.length - 1]?.scheduledDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Event and Tasks if isDelete is true
exports.deleteEvent = async (req, res) => {
  const { eventId, isDelete } = req.body;

  if (!isDelete) {
    return res
      .status(400)
      .json({ message: "Event is not marked for deletion." });
  }

  try {
    // Fetch the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Delete the event
    await event.remove();

    // Optionally, you can also delete the associated tasks or mark them as deleted
    await GlobalTask.updateMany(
      {
        _id: {
          $in: event.tasks
            .filter((t) => t.taskType === "GlobalTask")
            .map((t) => t.task),
        },
      },
      { $set: { isDeleted: true } }
    );
    await PrivateTask.updateMany(
      {
        _id: {
          $in: event.tasks
            .filter((t) => t.taskType === "PrivateTask")
            .map((t) => t.task),
        },
        user: user,
      },
      { $set: { isDeleted: true } }
    );

    res
      .status(200)
      .json({ message: "Event and associated tasks deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get Event and its associated tasks


exports.getEventDetail = async (req, res) => {
  const { eventId, userId } = req.params; // Get both eventId and userId from the request params

  try {
    // Fetch the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Fetch Global and Private Tasks from the database
    const globalTaskIds = event.tasks
      .filter((t) => t.taskType === "GlobalTask")
      .map((t) => t.task);
    const privateTaskIds = event.tasks
      .filter((t) => t.taskType === "PrivateTask")
      .map((t) => t.task);

    // Fetch global tasks based on globalTaskIds
    const globalTasks = await GlobalTask.find({
      _id: { $in: globalTaskIds },
    });

    // Fetch private tasks based on privateTaskIds and ensure the tasks belong to the current user
    const privateTasks = await PrivateTask.find({
      _id: { $in: privateTaskIds },
      user: userId, // Ensure tasks belong to the current user (use userId here)
    });

    // If tasks are not found, return an error message
    if (
      globalTasks.length !== globalTaskIds.length ||
      privateTasks.length !== privateTaskIds.length
    ) {
      return res
        .status(400)
        .json({ message: "One or more tasks are missing." });
    }

    // Combine both global and private tasks into a single list for scheduling
    const allTasks = [...globalTasks, ...privateTasks];

    // 1. Calculate the task execution order
    const taskExecutionOrder = calculateTaskExecutionOrder(allTasks);

    // 2. Calculate the total time needed to complete all tasks
    const totalTime = calculateTotalTime(taskExecutionOrder);

    // 3. Calculate task start dates based on the event start date and task durations
    const taskDates = calculateTaskDates(taskExecutionOrder, event.eventDate);

    // 4. Calculate the event plan start and end dates
    const planStartDate = taskDates[0]?.scheduledDate;
    const planEndDate = taskDates[taskDates.length - 1]?.scheduledDate;

    // Add start and end date for each task
    const tasksWithDates = taskExecutionOrder.map((task, index) => {
      const taskDate = taskDates[index];
      return {
        ...task.toObject(), // Converts Mongoose document to plain JavaScript object
        startDate: taskDate.scheduledDate,
        endDate: new Date(
          taskDate.scheduledDate.getTime() + task.duration * 60 * 60 * 1000 // Assuming duration in hours
        ),
      };
    });

    // Prepare a summary of the scheduling results
    const summary = {
      totalTasks: allTasks.length,
      totalEstimatedDuration: totalTime, // Total estimated duration in hours or appropriate unit
      taskExecutionOrder: tasksWithDates,
      taskDates: taskDates,
      planStartDate: planStartDate,
      planEndDate: planEndDate,
    };

    // Send the event, tasks, and scheduling summary in the response
    res.status(200).json({
      event,
      globalTasks,
      privateTasks,
      summary,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all events for the user and their associated tasks
exports.getUserEvents = async (req, res) => {
    const {id} = req.params
  try {
    // Ensure userId is an ObjectId
    const events = await Event.find({
      user: new mongoose.Types.ObjectId(id), // Convert string to ObjectId if needed
    }).populate("tasks.task"); // Optionally populate tasks if you want task details

    console.log(events); // Or handle the events however you'd like
    return res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
  }

};
