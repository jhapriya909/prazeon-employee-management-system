const Attendance = require("../models/Attendance");
const User = require("../models/User");

const getStartOfDay = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date = new Date()) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Employee check-in
const checkIn = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (attendance?.checkIn) {
      return res.status(400).json({
        success: false,
        message: "You have already checked in today",
      });
    }

    if (!attendance) {
      attendance = await Attendance.create({
        employee: employeeId,
        date: startOfDay,
        checkIn: new Date(),
        status: "Present",
      });
    } else {
      attendance.checkIn = new Date();
      attendance.status = "Present";
      await attendance.save();
    }

    return res.status(200).json({
      success: true,
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error("Check-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check in",
      error: error.message,
    });
  }
};

// Employee check-out
const checkOut = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Please check in before checking out",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out today",
      });
    }

    const checkOutTime = new Date();

    const totalMinutes = Math.floor(
      (checkOutTime.getTime() - attendance.checkIn.getTime()) /
        (1000 * 60)
    );

    attendance.checkOut = checkOutTime;
    attendance.totalMinutes = totalMinutes;

    attendance.status =
      totalMinutes < 240 ? "Half Day" : "Present";

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Checked out successfully",
      attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check out",
      error: error.message,
    });
  }
};

// Employee today's attendance
const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    return res.status(200).json({
      success: true,
      attendance: attendance || null,
    });
  } catch (error) {
    console.error("Today attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch today's attendance",
      error: error.message,
    });
  }
};

// Employee monthly history
const getAttendanceHistory = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const currentDate = new Date();

    const month =
      Number(req.query.month) || currentDate.getMonth() + 1;

    const year =
      Number(req.query.year) || currentDate.getFullYear();

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12",
      });
    }

    const monthStart = new Date(year, month - 1, 1);
    const nextMonthStart = new Date(year, month, 1);

    const attendance = await Attendance.find({
      employee: employeeId,
      date: {
        $gte: monthStart,
        $lt: nextMonthStart,
      },
    }).sort({ date: -1 });

    const summary = attendance.reduce(
      (result, record) => {
        result.totalRecords += 1;
        result.totalMinutes += record.totalMinutes || 0;

        if (record.status === "Present") result.presentDays += 1;
        if (record.status === "Half Day") result.halfDays += 1;
        if (record.status === "Absent") result.absentDays += 1;
        if (record.status === "Leave") result.leaveDays += 1;
        if (record.status === "Week Off") result.weekOffDays += 1;

        return result;
      },
      {
        totalRecords: 0,
        presentDays: 0,
        halfDays: 0,
        absentDays: 0,
        leaveDays: 0,
        weekOffDays: 0,
        totalMinutes: 0,
      }
    );

    return res.status(200).json({
      success: true,
      month,
      year,
      count: attendance.length,
      summary,
      attendance,
    });
  } catch (error) {
    console.error("Attendance history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch attendance history",
      error: error.message,
    });
  }
};

// Admin: all employees' attendance
const getAllAttendance = async (req, res) => {
  try {
    const selectedDate = req.query.date
      ? new Date(`${req.query.date}T00:00:00`)
      : new Date();

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const startOfDay = getStartOfDay(selectedDate);
    const endOfDay = getEndOfDay(selectedDate);

    const employees = await User.find({
      role: "employee",
      isActive: true,
    })
      .select(
        "employeeId name email department designation profileImage"
      )
      .sort({ name: 1 });

    const records = await Attendance.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).populate(
      "employee",
      "employeeId name email department designation profileImage"
    );

    const recordMap = new Map(
      records.map((record) => [
        record.employee?._id?.toString(),
        record,
      ])
    );

    const attendance = employees.map((employee) => {
      const record = recordMap.get(employee._id.toString());

      return {
        _id: record?._id || null,
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          profileImage: employee.profileImage,
        },
        date: record?.date || startOfDay,
        checkIn: record?.checkIn || null,
        checkOut: record?.checkOut || null,
        totalMinutes: record?.totalMinutes || 0,
        status: record?.status || "Absent",
      };
    });

    const summary = attendance.reduce(
      (result, record) => {
        if (record.status === "Present") result.present += 1;
        if (record.status === "Half Day") result.halfDay += 1;
        if (record.status === "Absent") result.absent += 1;
        if (record.status === "Leave") result.leave += 1;

        if (record.checkIn && !record.checkOut) {
          result.currentlyWorking += 1;
        }

        return result;
      },
      {
        totalEmployees: employees.length,
        present: 0,
        halfDay: 0,
        absent: 0,
        leave: 0,
        currentlyWorking: 0,
      }
    );

    return res.status(200).json({
      success: true,
      date: startOfDay,
      summary,
      attendance,
    });
  } catch (error) {
    console.error("Admin attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch employee attendance",
      error: error.message,
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAllAttendance,
};