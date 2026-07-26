const express = require("express");

const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAllAttendance,
} = require("../controllers/attendanceController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Employee routes
router.post("/check-in", protect, checkIn);
router.put("/check-out", protect, checkOut);
router.get("/today", protect, getTodayAttendance);
router.get("/history", protect, getAttendanceHistory);

// Admin route
router.get(
  "/all",
  protect,
  authorizeRoles("admin"),
  getAllAttendance
);

module.exports = router;