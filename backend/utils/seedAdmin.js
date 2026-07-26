const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
      process.exit(1);
    }

    const existingAdmin = await User.findOne({
      email: adminEmail.toLowerCase(),
    });

    // Agar admin already hai to password update karo
    if (existingAdmin) {
      existingAdmin.name = "Prazeon Admin";
      existingAdmin.password = adminPassword;
      existingAdmin.role = "admin";
      existingAdmin.department = "Management";
      existingAdmin.designation = "Administrator";
      existingAdmin.employeeId = "PRAZEON-ADMIN-001";
      existingAdmin.isActive = true;

      await existingAdmin.save();

      console.log("Admin password updated successfully");
      process.exit(0);
    }

    // Agar admin nahi hai to naya admin banao
    await User.create({
      employeeId: "PRAZEON-ADMIN-001",
      name: "Prazeon Admin",
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: "admin",
      department: "Management",
      designation: "Administrator",
      isActive: true,
    });

    console.log("Admin created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Admin seed error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin();