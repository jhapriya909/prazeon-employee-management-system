const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/profileController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/me",
  protect,
  authorizeRoles("employee", "admin"),
  getMyProfile
);

router.put(
  "/me",
  protect,
  authorizeRoles("employee", "admin"),
  updateMyProfile
);

module.exports = router;