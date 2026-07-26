const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Admin: create and assign internal task
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectName,
      assignedTo,
      priority,
      dueDate,
    } = req.body;

    if (!title || !description || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, assigned employee and due date are required",
      });
    }

    if (!isValidObjectId(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await User.findById(assignedTo);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Assigned employee not found",
      });
    }

    if (employee.role !== "employee") {
      return res.status(400).json({
        success: false,
        message: "Task can only be assigned to an employee",
      });
    }

    if (!employee.isActive) {
      return res.status(400).json({
        success: false,
        message: "Task cannot be assigned to an inactive employee",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      projectName: projectName?.trim() || "Employee Portal",
      taskType: "Internal Task",
      assignedTo,
      assignedBy: req.user._id,
      priority: priority || "Medium",
      dueDate,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email employeeId designation")
      .populate("assignedBy", "name email role");

    return res.status(201).json({
      success: true,
      message: "Task created and assigned successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create task",
      error: error.message,
    });
  }
};

// Client: create new request
const createClientRequest = async (req, res) => {
  try {
    const { title, description, priority, projectName } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const allowedPriorities = ["Low", "Medium", "High", "Urgent"];

    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      projectName: projectName?.trim() || "Client Project",
      taskType: "Client Request",
      createdByClient: req.user._id,
      priority: priority || "Medium",
      status: "Pending",
      assignedTo: null,
      assignedBy: null,
      dueDate: null,
    });

    const populatedTask = await Task.findById(task._id).populate(
      "createdByClient",
      "name email"
    );

    return res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create client request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit request",
      error: error.message,
    });
  }
};

// Client: get only own requests
const getMyClientRequests = async (req, res) => {
  try {
    const requests = await Task.find({
      taskType: "Client Request",
      createdByClient: req.user._id,
    })
      .populate("assignedTo", "name email employeeId designation")
      .populate("assignedBy", "name email")
      .populate("comments.createdBy", "name email role")
      .sort({ createdAt: -1 });

    const summary = {
      total: requests.length,
      pending: requests.filter((item) => item.status === "Pending").length,
      inProgress: requests.filter(
        (item) => item.status === "In Progress"
      ).length,
      done: requests.filter((item) => item.status === "Done").length,
      archived: requests.filter((item) => item.isArchived).length,
    };

    return res.status(200).json({
      success: true,
      summary,
      requests,
    });
  } catch (error) {
    console.error("Get client requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your requests",
      error: error.message,
    });
  }
};

// Client: get one own request
const getClientRequestById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    const request = await Task.findOne({
      _id: req.params.id,
      taskType: "Client Request",
      createdByClient: req.user._id,
    })
      .populate("assignedTo", "name email employeeId designation")
      .populate("assignedBy", "name email")
      .populate("createdByClient", "name email")
      .populate("comments.createdBy", "name email role");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get client request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch request",
      error: error.message,
    });
  }
};

// Employee: get own assigned tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
      isArchived: false,
    })
      .populate("assignedBy", "name email")
      .populate("createdByClient", "name email")
      .populate("comments.createdBy", "name email role")
      .sort({ createdAt: -1 });

    const summary = {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "Pending").length,
      inProgress: tasks.filter((task) => task.status === "In Progress").length,
      done: tasks.filter((task) => task.status === "Done").length,
    };

    return res.status(200).json({
      success: true,
      summary,
      tasks,
    });
  } catch (error) {
    console.error("Get my tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tasks",
      error: error.message,
    });
  }
};

// Admin: get all active tasks and requests
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      isArchived: false,
    })
      .populate("assignedTo", "name email employeeId designation")
      .populate("assignedBy", "name email")
      .populate("createdByClient", "name email")
      .populate("comments.createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get all tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch all tasks",
      error: error.message,
    });
  }
};

// Admin: get unassigned client request queue
const getClientRequestQueue = async (req, res) => {
  try {
    const requests = await Task.find({
      taskType: "Client Request",
      assignedTo: null,
      isArchived: false,
    })
      .populate("createdByClient", "name email")
      .populate("comments.createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get request queue error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch request queue",
      error: error.message,
    });
  }
};

// Admin: assign client request to employee
const assignClientRequest = async (req, res) => {
  try {
    const { assignedTo, dueDate } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Employee is required",
      });
    }

    if (!isValidObjectId(req.params.id) || !isValidObjectId(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request or employee ID",
      });
    }

    const employee = await User.findById(assignedTo);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employee.role !== "employee") {
      return res.status(400).json({
        success: false,
        message: "Request can only be assigned to an employee",
      });
    }

    if (!employee.isActive) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be assigned to an inactive employee",
      });
    }

    const request = await Task.findOne({
      _id: req.params.id,
      taskType: "Client Request",
      isArchived: false,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Client request not found",
      });
    }

    request.assignedTo = assignedTo;
    request.assignedBy = req.user._id;

    if (dueDate) {
      request.dueDate = dueDate;
    }

    await request.save();

    const populatedRequest = await Task.findById(request._id)
      .populate("assignedTo", "name email employeeId designation")
      .populate("assignedBy", "name email")
      .populate("createdByClient", "name email");

    return res.status(200).json({
      success: true,
      message: "Request assigned successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("Assign client request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign request",
      error: error.message,
    });
  }
};

// Employee: update own task/request status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["Pending", "In Progress", "Done"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
      isArchived: false,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or access denied",
      });
    }

    task.status = status;
    task.completedAt = status === "Done" ? new Date() : null;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email employeeId")
      .populate("assignedBy", "name email")
      .populate("createdByClient", "name email")
      .populate("comments.createdBy", "name email role");

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update task status",
      error: error.message,
    });
  }
};

// Client, employee and admin: add comment
const addTaskComment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment message is required",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isAssignedEmployee =
      task.assignedTo &&
      task.assignedTo.toString() === req.user._id.toString();

    const isRequestOwner =
      task.taskType === "Client Request" &&
      task.createdByClient &&
      task.createdByClient.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedEmployee && !isRequestOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to comment on this request",
      });
    }

    if (task.isArchived && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Archived request cannot be updated",
      });
    }

    task.comments.push({
      message: message.trim(),
      createdBy: req.user._id,
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("comments.createdBy", "name email role")
      .populate("assignedTo", "name email employeeId")
      .populate("assignedBy", "name email")
      .populate("createdByClient", "name email");

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Add task comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add comment",
      error: error.message,
    });
  }
};

// Admin: archive task/request without deleting history
const archiveTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.isArchived = true;
    task.closedAt = new Date();

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task archived successfully. History has been preserved.",
    });
  } catch (error) {
    console.error("Archive task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to archive task",
      error: error.message,
    });
  }
};

// Admin: get archived task/request history
const getArchivedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      isArchived: true,
    })
      .populate("assignedTo", "name email employeeId designation")
      .populate("assignedBy", "name email")
      .populate("createdByClient", "name email")
      .populate("comments.createdBy", "name email role")
      .sort({ closedAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get archived tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch archived history",
      error: error.message,
    });
  }
};

module.exports = {
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
};