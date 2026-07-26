const express = require("express");

const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getAllUsers,
  getAllClients,
} = require("../controllers/authController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* ===========================
   Public Routes
=========================== */

// Login (Admin / Employee / Client)
router.post("/login", loginUser);

// Client Self Registration
router.post("/client-register", (req, res, next) => {
  req.body.role = "client";
  next();
}, registerUser);

/* ===========================
   Admin Routes
=========================== */

// Admin creates Employee
router.post(
  "/register",
  protect,
  authorizeRoles("admin"),
  (req, res, next) => {
    req.body.role = "employee";
    next();
  },
  registerUser
);

// Employee List
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

// Client List
router.get(
  "/clients",
  protect,
  authorizeRoles("admin"),
  getAllClients
);

/* ===========================
   Logged-in User
=========================== */

router.post("/logout", protect, logoutUser);

router.get("/me", protect, getCurrentUser);

module.exports = router;