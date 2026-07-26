const express = require("express");

const {
  createTask,
  createClientRequest,
  getMyClientRequests,
  getClientRequestById,
  getMyTasks,
  getAllTasks,
  getClientRequestQueue,
  assignClientRequest,
  updateTaskStatus,
  addTaskComment,
  archiveTask,
  getArchivedTasks,
} = require("../controllers/taskController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Client Routes
|--------------------------------------------------------------------------
*/

// Client submits new request
router.post(
  "/client/create",
  protect,
  authorizeRoles("client"),
  createClientRequest
);

// Client sees only their own requests
router.get(
  "/client/my",
  protect,
  authorizeRoles("client"),
  getMyClientRequests
);

// Client sees one of their own requests
router.get(
  "/client/:id",
  protect,
  authorizeRoles("client"),
  getClientRequestById
);

/*
|--------------------------------------------------------------------------
| Employee Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/my",
  protect,
  authorizeRoles("employee"),
  getMyTasks
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("employee"),
  updateTaskStatus
);

/*
|--------------------------------------------------------------------------
| Shared Comment Route
|--------------------------------------------------------------------------
*/

// Client, assigned employee and admin can comment
router.post(
  "/:id/comments",
  protect,
  authorizeRoles("client", "employee", "admin"),
  addTaskComment
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Admin creates internal task
router.post(
  "/create",
  protect,
  authorizeRoles("admin"),
  createTask
);

// Admin sees all active tasks and requests
router.get(
  "/all",
  protect,
  authorizeRoles("admin"),
  getAllTasks
);

// Admin sees unassigned client request queue
router.get(
  "/client-queue",
  protect,
  authorizeRoles("admin"),
  getClientRequestQueue
);

// Admin assigns a client request to employee
router.put(
  "/:id/assign",
  protect,
  authorizeRoles("admin"),
  assignClientRequest
);

// Admin sees archived history
router.get(
  "/archived",
  protect,
  authorizeRoles("admin"),
  getArchivedTasks
);

// Admin archives task/request
router.put(
  "/:id/archive",
  protect,
  authorizeRoles("admin"),
  archiveTask
);

module.exports = router;