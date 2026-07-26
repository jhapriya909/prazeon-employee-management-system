const User = require("../models/User");

// Employee ID generate karne ke liye
const generateEmployeeId = async () => {
  const latestEmployee = await User.findOne({
    role: "employee",
    employeeId: { $regex: /^PRAZEON-EMP-/ },
  })
    .sort({ createdAt: -1 })
    .select("employeeId");

  let nextNumber = 1;

  if (latestEmployee?.employeeId) {
    const lastNumber = Number(
      latestEmployee.employeeId.split("-").pop()
    );

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `PRAZEON-EMP-${String(nextNumber).padStart(3, "0")}`;
};

// @desc    Add new employee
// @route   POST /api/employees
// @access  Admin
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      department,
      designation,
      joiningDate,
      leaveBalance,
    } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const employeeId = await generateEmployeeId();

    const employee = await User.create({
      employeeId,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "employee",
      phone: phone?.trim() || "",
      department: department?.trim() || "",
      designation: designation?.trim() || "",
      joiningDate: joiningDate || Date.now(),
      leaveBalance: {
        casual:
          leaveBalance?.casual !== undefined
            ? Number(leaveBalance.casual)
            : 12,
        sick:
          leaveBalance?.sick !== undefined
            ? Number(leaveBalance.sick)
            : 10,
        earned:
          leaveBalance?.earned !== undefined
            ? Number(leaveBalance.earned)
            : 15,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      employee,
    });
  } catch (error) {
    console.error("Create employee error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Employee email or employee ID already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create employee.",
    });
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Admin
const getEmployees = async (req, res) => {
  try {
    const {
      search = "",
      department = "",
      status = "all",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      role: "employee",
    };

    if (search.trim()) {
      query.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          email: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          employeeId: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          designation: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (department.trim()) {
      query.department = {
        $regex: `^${department.trim()}$`,
        $options: "i",
      };
    }

    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip = (currentPage - 1) * pageLimit;

    const [employees, totalEmployees] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalEmployees / pageLimit);

    return res.status(200).json({
      success: true,
      employees,
      pagination: {
        totalEmployees,
        currentPage,
        totalPages,
        limit: pageLimit,
      },
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load employees.",
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Admin
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to load employee details.",
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Admin
const updateEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      designation,
      joiningDate,
      profileImage,
      leaveBalance,
    } = req.body;

    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (email && email.trim().toLowerCase() !== employee.email) {
      const emailExists = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: employee._id },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Another account already uses this email.",
        });
      }

      employee.email = email.trim().toLowerCase();
    }

    if (name !== undefined) {
      employee.name = name.trim();
    }

    if (phone !== undefined) {
      employee.phone = phone.trim();
    }

    if (department !== undefined) {
      employee.department = department.trim();
    }

    if (designation !== undefined) {
      employee.designation = designation.trim();
    }

    if (joiningDate) {
      employee.joiningDate = joiningDate;
    }

    if (profileImage !== undefined) {
      employee.profileImage = profileImage;
    }

    if (leaveBalance) {
      if (leaveBalance.casual !== undefined) {
        employee.leaveBalance.casual = Math.max(
          Number(leaveBalance.casual),
          0
        );
      }

      if (leaveBalance.sick !== undefined) {
        employee.leaveBalance.sick = Math.max(
          Number(leaveBalance.sick),
          0
        );
      }

      if (leaveBalance.earned !== undefined) {
        employee.leaveBalance.earned = Math.max(
          Number(leaveBalance.earned),
          0
        );
      }
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          Object.values(error.errors)[0]?.message ||
          "Invalid employee data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update employee.",
    });
  }
};

// @desc    Activate or deactivate employee
// @route   PATCH /api/employees/:id/status
// @access  Admin
const updateEmployeeStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee",
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    employee.isActive = isActive;
    employee.deactivatedAt = isActive ? null : new Date();

    await employee.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Employee activated successfully."
        : "Employee deactivated successfully.",
      employee,
    });
  } catch (error) {
    console.error("Update employee status error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update employee status.",
    });
  }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Admin
const getEmployeeStats = async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departments,
    ] = await Promise.all([
      User.countDocuments({
        role: "employee",
      }),
      User.countDocuments({
        role: "employee",
        isActive: true,
      }),
      User.countDocuments({
        role: "employee",
        isActive: false,
      }),
      User.distinct("department", {
        role: "employee",
        department: { $ne: "" },
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalDepartments: departments.length,
      },
      departments,
    });
  } catch (error) {
    console.error("Get employee stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load employee statistics.",
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  updateEmployeeStatus,
  getEmployeeStats,
};