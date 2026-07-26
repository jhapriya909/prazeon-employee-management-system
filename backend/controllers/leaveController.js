const Leave = require("../models/Leave");

const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference = end.getTime() - start.getTime();

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
};

const applyLeave = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);
    const employeeId = req.user._id;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or end date",
      });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    const overlappingLeave = await Leave.findOne({
      employee: employeeId,
      status: {
        $in: ["Pending", "Approved"],
      },
      startDate: {
        $lte: end,
      },
      endDate: {
        $gte: start,
      },
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message:
          "A pending or approved leave request already exists for these dates",
      });
    }

    const totalDays = calculateLeaveDays(start, end);

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      leave,
    });
  } catch (error) {
    console.error("Apply leave error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit leave request",
      error: error.message,
    });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { status, year } = req.query;

    const filter = {
      employee: employeeId,
    };

    if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
      filter.status = status;
    }

    if (year) {
      const selectedYear = Number(year);

      if (!Number.isInteger(selectedYear)) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      filter.startDate = {
        $gte: new Date(selectedYear, 0, 1),
        $lt: new Date(selectedYear + 1, 0, 1),
      };
    }

    const leaves = await Leave.find(filter)
      .populate("approvedBy", "name email role")
      .sort({ createdAt: -1 });

    const summary = leaves.reduce(
      (result, leave) => {
        result.totalRequests += 1;

        if (leave.status === "Pending") {
          result.pendingRequests += 1;
        }

        if (leave.status === "Approved") {
          result.approvedRequests += 1;
          result.approvedDays += leave.totalDays;
        }

        if (leave.status === "Rejected") {
          result.rejectedRequests += 1;
        }

        return result;
      },
      {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        approvedDays: 0,
      }
    );

    return res.status(200).json({
      success: true,
      count: leaves.length,
      summary,
      leaves,
    });
  } catch (error) {
    console.error("Get employee leaves error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch leave requests",
      error: error.message,
    });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType } = req.query;

    const filter = {};

    if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
      filter.status = status;
    }

    if (leaveType && ["Casual", "Sick", "Earned"].includes(leaveType)) {
      filter.leaveType = leaveType;
    }

    const leaves = await Leave.find(filter)
      .populate("employee", "name email role designation")
      .populate("approvedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("Get all leaves error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch leave requests",
      error: error.message,
    });
  }
};

const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Leave request is already ${leave.status.toLowerCase()}`,
      });
    }

    leave.status = "Approved";
    leave.approvedBy = req.user._id;
    leave.rejectionReason = "";

    await leave.save();

    await leave.populate([
      {
        path: "employee",
        select: "name email role designation",
      },
      {
        path: "approvedBy",
        select: "name email role",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Leave request approved successfully",
      leave,
    });
  } catch (error) {
    console.error("Approve leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve leave request",
      error: error.message,
    });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Leave request is already ${leave.status.toLowerCase()}`,
      });
    }

    leave.status = "Rejected";
    leave.approvedBy = req.user._id;
    leave.rejectionReason = rejectionReason.trim();

    await leave.save();

    await leave.populate([
      {
        path: "employee",
        select: "name email role designation",
      },
      {
        path: "approvedBy",
        select: "name email role",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Leave request rejected successfully",
      leave,
    });
  } catch (error) {
    console.error("Reject leave error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject leave request",
      error: error.message,
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
};