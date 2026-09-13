import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AuditLogs.module.css";

function AuditLogs() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [auditLogs, setAuditLogs] = useState([]);

  const [popup, setPopup] = useState({
    show: false,
    type: "error",
    title: "",
    message: "",
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const showPopup = (type, title, message) => {
    setPopup({
      show: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    const wasPermissionDenied = popup.type === "permission";

    setPopup({
      show: false,
      type: "error",
      title: "",
      message: "",
    });

    if (wasPermissionDenied) {
      navigate("/dashboard", { replace: true });
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/audit-logs`,
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
          showPopup(
            "permission",
            "Access Denied",
            result.message ||
              "You do not have permission to access Audit Logs."
          );
          return;
        }

        throw new Error(
          result.message || "Unable to fetch audit logs."
        );
      }

      const formattedLogs = result.data.auditLogs.map((log) => ({
        id: log._id,
        user: log.user,
        role: log.role,
        action: log.action,
        resource: log.resource,
        timestamp: formatTimestamp(log.timestamp),
        status: log.status,
      }));

      setAuditLogs(formattedLogs);
    } catch (error) {
      console.error("Audit logs fetch error:", error);

      showPopup(
        "error",
        "Unable to Load Audit Logs",
        error.message || "Unable to load audit logs."
      );
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.role.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());

    const matchesAction =
      actionFilter === "All Actions" ||
      log.action === actionFilter;

    const matchesStatus =
      statusFilter === "All Status" ||
      log.status === statusFilter;

    return matchesSearch && matchesAction && matchesStatus;
  });

  return (
    <div className={styles.auditLogs}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Audit Logs</h1>
          <p>
            Track authentication, data access, system changes and AI decisions.
          </p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <span>Total Events</span>
          <strong>{auditLogs.length}</strong>
          <small>Recorded audit events</small>
        </div>

        <div className={styles.card}>
          <span>AI Events</span>
          <strong>
            {
              auditLogs.filter(
                (log) =>
                  log.action === "AI Execution" ||
                  log.action === "Override"
              ).length
            }
          </strong>
          <small>AI-related activities</small>
        </div>

        <div className={styles.card}>
          <span>Approvals</span>
          <strong>
            {
              auditLogs.filter(
                (log) =>
                  log.action === "Approval" ||
                  log.action === "Rejection"
              ).length
            }
          </strong>
          <small>Purchase decisions</small>
        </div>

        <div className={styles.card}>
          <span>Successful Events</span>
          <strong>
            {
              auditLogs.filter(
                (log) => log.status === "Success"
              ).length
            }
          </strong>
          <small>Completed actions</small>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search users or resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={styles.select}
          >
            <option>All Actions</option>
            <option>Authentication</option>
            <option>Data Access</option>
            <option>Create</option>
            <option>Update</option>
            <option>Delete</option>
            <option>Export</option>
            <option>AI Execution</option>
            <option>Approval</option>
            <option>Rejection</option>
            <option>Override</option>
            <option>Config</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option>All Status</option>
            <option>Success</option>
            <option>Failed</option>
          </select>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.user}</strong>
                  </td>

                  <td>{log.role}</td>

                  <td>
                    <span className={styles.action}>
                      {log.action}
                    </span>
                  </td>

                  <td>{log.resource}</td>

                  <td className={styles.timestamp}>
                    {log.timestamp}
                  </td>

                  <td>
                    <span
                      className={
                        log.status === "Success"
                          ? styles.success
                          : styles.failed
                      }
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.noResults}>
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.immutableNote}>
          <strong>Audit records are immutable.</strong>
          <span>
            Audit events cannot be edited or deleted from the application.
          </span>
        </div>
      </section>

      {popup.show && (
        <div
          className={styles.popupOverlay}
          onClick={closePopup}
        >
          <div
            className={styles.popup}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`${styles.popupIcon} ${
                popup.type === "permission"
                  ? styles.permissionIcon
                  : styles.errorIcon
              }`}
            >
              !
            </div>

            <h3>{popup.title}</h3>

            <p>{popup.message}</p>

            <button
              type="button"
              className={styles.popupButton}
              onClick={closePopup}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;