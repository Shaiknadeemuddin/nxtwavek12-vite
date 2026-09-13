import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Notifications.module.css";

function Notifications() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionPopup, setPermissionPopup] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/notifications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
           if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
    return;
  }
          if (response.status === 403) {
            setPermissionPopup(true);
            return;
          }

          throw new Error(
            result.message || "Unable to fetch notifications."
          );
        }

        setNotifications(result.data.notifications);
      } catch (error) {
        console.error("Notifications fetch error:", error);
        setError("Unable to load notifications data.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      notification.message
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Unread" && !notification.read) ||
      notification.type === filter;

    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const urgentCount = notifications.filter(
    (notification) => notification.type === "Urgent"
  ).length;

  const approvalCount = notifications.filter(
    (notification) => notification.type === "Approval"
  ).length;

  const markAsRead = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to mark notification as read."
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark as read error:", error);
      window.alert("Unable to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to mark all notifications as read."
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Mark all as read error:", error);
      window.alert("Unable to mark all notifications as read.");
    }
  };

  const clearNotification = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to clear notification."
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) => notification._id !== id
        )
      );
    } catch (error) {
      console.error("Clear notification error:", error);
      window.alert("Unable to clear notification.");
    }
  };

  if (permissionPopup) {
    return (
      <div className={styles.notifications}>
        <div className={styles.popupOverlay}>
          <div
            className={styles.popup}
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-title"
          >
            <div
              className={`${styles.popupIcon} ${styles.permissionIcon}`}
            >
              !
            </div>

            <h3 id="permission-title">Access Denied</h3>

            <p>
              You do not have permission to access notifications.
            </p>

            <button
              type="button"
              className={styles.popupButton}
              onClick={() =>
                navigate("/dashboard", { replace: true })
              }
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.notifications}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Notifications</h1>
            <p>Loading notifications data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.notifications}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Notifications</h1>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.notifications}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Notifications</h1>
          <p>
            View alerts, approvals, assignments and system events.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className={styles.markAllButton}
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <span>Total Notifications</span>
          <strong>{notifications.length}</strong>
          <small>Current notifications</small>
        </div>

        <div className={styles.card}>
          <span>Unread</span>
          <strong>{unreadCount}</strong>
          <small>Require attention</small>
        </div>

        <div className={styles.card}>
          <span>Urgent</span>
          <strong>{urgentCount}</strong>
          <small>Critical notifications</small>
        </div>

        <div className={styles.card}>
          <span>Approvals</span>
          <strong>{approvalCount}</strong>
          <small>Pending review notifications</small>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.select}
          >
            <option>All</option>
            <option>Unread</option>
            <option>Urgent</option>
            <option>Approval</option>
            <option>AI</option>
            <option>Alert</option>
            <option>System</option>
          </select>
        </div>

        <div className={styles.notificationList}>
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`${styles.notification} ${
                !notification.read ? styles.unread : ""
              }`}
            >
              <div className={styles.notificationIcon}>
                {notification.type === "Urgent"
                  ? "!"
                  : notification.type === "Approval"
                    ? "✓"
                    : notification.type === "AI"
                      ? "AI"
                      : "i"}
              </div>

              <div className={styles.notificationContent}>
                <div className={styles.notificationTop}>
                  <h3>{notification.title}</h3>

                  <span className={styles.type}>
                    {notification.type}
                  </span>
                </div>

                <p>{notification.message}</p>

                <span className={styles.time}>
                  {notification.time}
                </span>
              </div>

              <div className={styles.actions}>
                {!notification.read && (
                  <button
                    className={styles.readButton}
                    onClick={() => markAsRead(notification._id)}
                  >
                    Mark read
                  </button>
                )}

                <button
                  className={styles.clearButton}
                  onClick={() =>
                    clearNotification(notification._id)
                  }
                >
                  Clear
                </button>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className={styles.emptyState}>
              <strong>No notifications found</strong>
              <span>
                There are no notifications matching your search or filter.
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Notifications;