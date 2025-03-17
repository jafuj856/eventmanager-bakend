const express = require('express');
const { register, resentOtp, verifyOtp, login } = require('../controller/auth');

const router = express.Router()
const { authUser } = require("../middlware/vendorAuth");
const { createEvent, getEventDetails, getEvent, updateEvent, deleteEvent, getEventDetail, getUserEvents } = require('../controller/eventController');
const { createPrivateTask, getPrivateTasks, deletePrivateTask, updatePrivateTask } = require('../controller/privatTaskController');
const {
  getGlobalTasks,
  createGlobalTask,
} = require("../controller/pblicTaskController");
const { } = require('../controller/pblicTaskController');
const { deleteGlobalTask } = require('../controller/pblicTaskController');
const { updateGlobalTask } = require('../controller/pblicTaskController');
router.get("/", (req, res) => {
       console.log("testing", res);
    res.send("User Homepage");
});
router.post("/register", register);
router.post('/resendOtp', resentOtp)
router.post("/verifyOtp", verifyOtp);
router.post("/login", login);
// Create Global Task (Admin Only)
router.post("/create-events", createEvent);
router.get("/getEventDetail/:eventId/:userId", getEventDetail);
router.get("/getEvent/:id", authUser, getUserEvents);
router.put("/event-update/:id", authUser,updateEvent );
router.put("/event-delete/:id", authUser, deleteEvent);

// Task routes
router.post("/create-private-tasks", authUser, createPrivateTask);
router.get("/private-tasks", authUser, getPrivateTasks);
router.put("/private-update/:id",authUser,updatePrivateTask);
router.put("/private-delete/:id",authUser,deletePrivateTask);

router.post("/create-global-tasks", authUser, createGlobalTask);
router.get("/global-tasks", authUser, getGlobalTasks);
router.put("/global-update/:id", authUser, updateGlobalTask);
router.put("/global-delete/:id", authUser, deleteGlobalTask);



module.exports = router;

