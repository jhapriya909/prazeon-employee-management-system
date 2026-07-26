const express = require("express");

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  updateEmployeeStatus,
  getEmployeeStats,
} = require("../controllers/employeeController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Employee Statistics
router.get(
  "/stats",
  protect,
  authorizeRoles("admin"),
  getEmployeeStats
);

// Employee List
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getEmployees
);

// Add Employee
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createEmployee
);

// Single Employee
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getEmployeeById
);

// Update Employee
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateEmployee
);

// Activate / Deactivate Employee
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateEmployeeStatus
);

module.exports = router;