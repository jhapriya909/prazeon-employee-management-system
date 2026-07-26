const express = require("express");

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} = require("../controllers/leaveController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Employee routes
router.post(
  "/apply",
  protect,
  authorizeRoles("employee"),
  applyLeave
);

router.get(
  "/my",
  protect,
  authorizeRoles("employee"),
  getMyLeaves
);

// Admin routes
router.get(
  "/all",
  protect,
  authorizeRoles("admin"),
  getAllLeaves
);

router.put(
  "/:id/approve",
  protect,
  authorizeRoles("admin"),
  approveLeave
);

router.put(
  "/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectLeave
);

module.exports = router;