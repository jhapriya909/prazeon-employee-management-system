const User = require("../models/User");
const Leave = require("../models/Leave");
const Task = require("../models/Task");

const getAdminDashboard = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({
      role: "employee",
    });

    const activeEmployees = await User.countDocuments({
      role: "employee",
      isActive: true,
    });

    const pendingLeaves = await Leave.countDocuments({
      status: "Pending",
    });

    const totalTasks = await Task.countDocuments();

    const recentEmployees = await User.find({
      role: "employee",
    })
      .select("name email department designation employeeId")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      totalTasks,
      recentEmployees,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Dashboard data failed",
    });
  }
};

module.exports = {
  getAdminDashboard,
};