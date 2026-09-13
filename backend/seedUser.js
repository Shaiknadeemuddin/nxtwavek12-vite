require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = [
      {
        name: "User",
        email: "admin@k12optimiser.com",
        password: "Admin@123",
        role: "Inventory Planner",
        status: "Active",
      },
      {
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        password: "User@123",
        role: "Procurement Manager",
        status: "Active",
      },
      {
        name: "Rahul Sharma",
        email: "ral.sharma@example.com",
        password: "User@123",
        role: "Procurement Manager",
        status: "Active",
      },
      {
        name: "Priya Reddy",
        email: "priya.reddy@example.com",
        password: "User@123",
        role: "Inventory Planner",
        status: "Active",
      },
      {
        name: "Arjun Kumar",
        email: "arjun.kumar@example.com",
        password: "User@123",
        role: "Warehouse User",
        status: "Active",
      },
      {
        name: "Sneha Patel",
        email: "sneha.patel@example.com",
        password: "User@123",
        role: "Finance Reviewer",
        status: "Active",
      },
      {
        name: "Vikram Singh",
        email: "vikram.singh@example.com",
        password: "User@123",
        role: "Supplier",
        status: "Inactive",
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({
        email: userData.email,
      });

      if (existingUser) {
        console.log(`Already exists: ${userData.email}`);
        continue;
      }

      const passwordHash = await bcrypt.hash(userData.password, 10);

      await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        status: userData.status,
      });

      console.log(`User created: ${userData.email}`);
    }

    console.log("All users processed successfully.");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error creating users:", error.message);
  }
};

createUsers();