const Event = require("../models/eventSchema");
const GlobalTask = require("../models/globalTaskSchema");
const PrivateTask = require("../models/privateTaskSchema");

// Dashboard Data for User
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total Events Count
    const totalEventsCount = await Event.countDocuments({ user: userId });

    // 2. Total Tasks (Private and Global) Count
    const totalPrivateTasksCount = await PrivateTask.countDocuments({
      user: userId,
    });
    const totalGlobalTasksCount = await GlobalTask.countDocuments({});

    // 3. Total Global Tasks Count
    const totalGlobalTasksForUser = await GlobalTask.countDocuments({
      user: userId,
    });

    // 4. Monthly Task Data (for graph view)
    // Aggregating the task count by month
    const privateTasksMonthlyData = await PrivateTask.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          count: { $sum: 1 }, // Count number of tasks per month
        },
      },
      { $sort: { _id: 1 } }, // Sort by month
    ]);

    const globalTasksMonthlyData = await GlobalTask.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          count: { $sum: 1 }, // Count number of tasks per month
        },
      },
      { $sort: { _id: 1 } }, // Sort by month
    ]);

    // Map the data into a more readable format
    const formatMonthlyData = (data) => {
      return data.map((item) => ({
        month: item._id,
        count: item.count,
      }));
    };

    const formattedPrivateTasksData = formatMonthlyData(
      privateTasksMonthlyData
    );
    const formattedGlobalTasksData = formatMonthlyData(globalTasksMonthlyData);

    // Send the response with the dashboard data
    res.status(200).json({
      totalEventsCount,
      totalPrivateTasksCount,
      totalGlobalTasksCount,
      totalGlobalTasksForUser,
      monthlyPrivateTasks: formattedPrivateTasksData,
      monthlyGlobalTasks: formattedGlobalTasksData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
