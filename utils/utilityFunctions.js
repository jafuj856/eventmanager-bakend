// Sort tasks based on dependencies and timing
const calculateTaskExecutionOrder = (tasks) => {
  return tasks.sort((a, b) => {
    if (a.customTiming === "before" && b.customTiming === "after") {
      return -1;
    } else if (a.customTiming === "after" && b.customTiming === "before") {
      return 1;
    }
    return 0;
  });
};

// Calculate the total time by adding the duration of each task
const calculateTotalTime = (taskExecutionOrder) => {
  return taskExecutionOrder.reduce((total, task) => total + task.duration, 0);
};

// Calculate task dates based on the event date and task timings (before/after)
const calculateTaskDates = (taskExecutionOrder, eventDate) => {
  let currentStartDate = eventDate;

  return taskExecutionOrder.map((task) => {
    let taskStartDate = new Date(currentStartDate);

    // Adjust the task start date based on custom timing (before or after event date)
    if (task.customTiming === "before") {
      taskStartDate = new Date(
        currentStartDate - task.duration * 60 * 60 * 1000
      );
    } else if (task.customTiming === "after") {
      taskStartDate = new Date(
        currentStartDate + task.duration * 60 * 60 * 1000
      );
    }

    // Update currentStartDate for the next task
    currentStartDate = new Date(
      taskStartDate.getTime() + task.duration * 60 * 60 * 1000
    );

    return { task, scheduledDate: taskStartDate };
  });
};

module.exports = {
  calculateTaskExecutionOrder,
  calculateTotalTime,
  calculateTaskDates,
};
