const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({
      createdAt: 1,
    });

    const totalUsers = users.length;

    const activeUsers = users.filter(
      (user) => user.status !== "Inactive"
    ).length;

    const inactiveUsers = users.filter(
      (user) => user.status === "Inactive"
    ).length;

    const roleCounts = {};

    users.forEach((user) => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    res.status(200).json({
      message: "Users data fetched successfully.",
      data: {
        users,
        kpis: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          roles: Object.keys(roleCounts).length,
        },
      },
    });
  } catch (error) {
    console.error("Users error:", error);

    res.status(500).json({
      message: "Unable to fetch users data.",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      status: "Active",
    });

    res.status(201).json({
      message: "User created successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      message: "Unable to create user.",
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Active or Inactive.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      message: "User status updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(500).json({
      message: "Unable to update user status.",
    });
  }
};

/* =========================
   GET PROFILE
========================= */

const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Users can only access their own profile
    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only access your own profile.",
      });
    }

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Unable to fetch profile.",
    });
  }
};

/* =========================
   UPDATE PROFILE
========================= */

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Users can only update their own profile
    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only update your own profile.",
      });
    }

    const { name, email, profileImage } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
    };

    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Unable to update profile.",
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserStatus,
  getProfile,
  updateProfile,
};