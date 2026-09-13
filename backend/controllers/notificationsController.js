const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    let notifications = await Notification.find().sort({ createdAt: 1 });

    // Add initial notifications if database is empty
    if (notifications.length === 0) {
      notifications = await Notification.insertMany([
        {
          title: "Critical stock alert",
          message:
            "Student Laptop - Standard is below the safety stock level.",
          type: "Urgent",
          time: "10 minutes ago",
          read: false,
        },
        {
          title: "Purchase approval required",
          message:
            "Science Lab Kit - Grade 10 purchase recommendation requires your review.",
          type: "Approval",
          time: "35 minutes ago",
          read: false,
        },
        {
          title: "Forecast updated",
          message:
            "Demand forecast has been updated for the next 30 days.",
          type: "AI",
          time: "1 hour ago",
          read: true,
        },
        {
          title: "Inventory threshold reached",
          message:
            "Science Lab Kit stock has fallen below the recommended safety level.",
          type: "Alert",
          time: "2 hours ago",
          read: false,
        },
        {
          title: "Purchase recommendation approved",
          message:
            "A4 Printer Paper purchase recommendation has been approved.",
          type: "System",
          time: "Yesterday",
          read: true,
        },
        {
          title: "Supplier performance updated",
          message:
            "Supplier performance scores have been updated for the current cycle.",
          type: "System",
          time: "Yesterday",
          read: true,
        },
      ]);
    }

    const kpis = {
      totalNotifications: notifications.length,
      unread: notifications.filter(
        (notification) => !notification.read
      ).length,
      urgent: notifications.filter(
        (notification) => notification.type === "Urgent"
      ).length,
      approvals: notifications.filter(
        (notification) => notification.type === "Approval"
      ).length,
    };

    res.status(200).json({
      message: "Notifications data fetched successfully.",
      data: {
        kpis,
        notifications,
      },
    });
  } catch (error) {
    console.error("Notifications error:", error);

    res.status(500).json({
      message: "Unable to fetch notifications data.",
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    res.status(200).json({
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    res.status(500).json({
      message: "Unable to mark notification as read.",
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    res.status(500).json({
      message: "Unable to mark all notifications as read.",
    });
  }
};

const clearNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    res.status(200).json({
      message: "Notification cleared successfully.",
    });
  } catch (error) {
    console.error("Clear notification error:", error);

    res.status(500).json({
      message: "Unable to clear notification.",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification,
};