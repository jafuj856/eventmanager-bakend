
const privateTaskSchema = require("../models/privateTaskSchema");

const createPrivateTask = async (req, res) => {
  const { description, duration, dependencies, timing,user } = req.body;
  

  try {
      const newTask = new privateTaskSchema({
        description,
        duration,
        dependencies,
        timing,
        user: user,
      });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
      console.log(err);
      
    res.status(500).json({ message: "Failed to create task",err:err });
  }
};
const getPrivateTasks = async (req, res) => {
  const userId = req.userId;
console.log(req.userId,'{{{{{{{{{{{{{{{{{{{{{{{{{{{');

  try {
    const tasks = await privateTaskSchema.find({ createdBy: userId,isDelete:false }); // User's private tasks
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch private tasks" });
  }
};
// Edit Global Task (Admin Only)
const updatePrivateTask = async (req, res) => {
  try {
    const updatedTask = await privateTaskSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // Delete Global Task (Admin Only)
const deletePrivateTask= async (req, res) => {
 try {
   const updatedTask = await privateTaskSchema.findByIdAndUpdate(
     req.params.id,
     { isDelete: true },
     { new: true }
   );
   if (!updatedTask) {
     return res.status(404).json({ message: "Task not found" });
   }
   res.status(200).json(updatedTask);
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
};
module.exports = {
  createPrivateTask,
  getPrivateTasks,
  deletePrivateTask,
  updatePrivateTask,
};