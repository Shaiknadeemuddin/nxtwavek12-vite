import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Users.module.css";

function Users() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    type: "error",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Inventory Planner",
  });

  const getDepartment = (role) => {
    if (role === "Procurement Manager") return "Procurement";
    if (role === "Inventory Planner") return "Inventory";
    if (role === "Warehouse User") return "Warehouse";
    if (role === "Finance Reviewer") return "Finance";
    if (role === "Supplier") return "External";

    return "General";
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

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          showPopup(
            "permission",
            "Access Denied",
            result.message ||
              "You do not have permission to access Users & Roles."
          );
          return;
        }

        throw new Error(
          result.message || "Unable to fetch users."
        );
      }

      const formattedUsers = result.data.users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: getDepartment(user.role),
        status: user.status || "Active",
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Users fetch error:", error);

      showPopup(
        "error",
        "Unable to Load Users",
        error.message || "Unable to load users."
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All Roles" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All Status" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleStatus = async (id) => {
    const user = users.find((currentUser) => currentUser.id === id);

    if (!user) return;

    const newStatus =
      user.status === "Active" ? "Inactive" : "Active";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update user status."
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === id
            ? {
                ...currentUser,
                status: newStatus,
              }
            : currentUser
        )
      );

      showPopup(
        "success",
        "Status Updated",
        `${user.name} is now ${newStatus}.`
      );
    } catch (error) {
      console.error("Update user status error:", error);

      showPopup(
        "error",
        "Unable to Update Status",
        error.message || "Unable to update user status."
      );
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.role
    ) {
      showPopup(
        "warning",
        "Incomplete Information",
        "Please fill in all fields before creating the user."
      );
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
          }),
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
              "You do not have permission to create users."
          );
          return;
        }

        throw new Error(
          result.message || "Unable to create user."
        );
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Inventory Planner",
      });

      setShowAddForm(false);

      showPopup(
        "success",
        "User Created",
        "The new user account was created successfully."
      );

      await fetchUsers();
    } catch (error) {
      console.error("Create user error:", error);

      showPopup(
        "error",
        "Unable to Create User",
        error.message || "Unable to create user."
      );
    }
  };

  return (
    <div className={styles.users}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Users & Roles</h1>
          <p>
            Manage users, roles, access and account status.
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {showAddForm && (
        <section className={styles.panel}>
          <div className={styles.rolesHeader}>
            <div>
              <h2>Add New User</h2>
              <p>
                Create a new user account and assign a system role.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddUser}>
            <div className={styles.toolbar}>
              <input
                type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleFormChange}
                className={styles.search}
              />

              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleFormChange}
                className={styles.search}
              />

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleFormChange}
                className={styles.search}
              />

              <select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                className={styles.select}
              >
                <option>Procurement Manager</option>
                <option>Inventory Planner</option>
                <option>Warehouse User</option>
                <option>Finance Reviewer</option>
                <option>Supplier</option>
              </select>

              <button
                type="submit"
                className={styles.addButton}
              >
                Create User
              </button>
            </div>
          </form>
        </section>
      )}

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <span>Total Users</span>
          <strong>{users.length}</strong>
          <small>Registered users</small>
        </div>

        <div className={styles.card}>
          <span>Active Users</span>
          <strong>
            {users.filter((user) => user.status === "Active").length}
          </strong>
          <small>Currently active</small>
        </div>

        <div className={styles.card}>
          <span>Inactive Users</span>
          <strong>
            {users.filter((user) => user.status === "Inactive").length}
          </strong>
          <small>Access disabled</small>
        </div>

        <div className={styles.card}>
          <span>Roles</span>
          <strong>5</strong>
          <small>Configured roles</small>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={styles.select}
          >
            <option>All Roles</option>
            <option>Procurement Manager</option>
            <option>Inventory Planner</option>
            <option>Warehouse User</option>
            <option>Finance Reviewer</option>
            <option>Supplier</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Access</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {user.name.charAt(0)}
                      </div>

                      <strong>{user.name}</strong>
                    </div>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span className={styles.role}>
                      {user.role}
                    </span>
                  </td>

                  <td>{user.department}</td>

                  <td>
                    <span
                      className={
                        user.status === "Active"
                          ? styles.active
                          : styles.inactive
                      }
                    >
                      {user.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className={
                        user.status === "Active"
                          ? styles.deactivateButton
                          : styles.activateButton
                      }
                      onClick={() => toggleStatus(user.id)}
                    >
                      {user.status === "Active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.noResults}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.rolesHeader}>
          <div>
            <h2>Role Permissions</h2>
            <p>
              Overview of the permissions assigned to each system role.
            </p>
          </div>
        </div>

        <div className={styles.permissionGrid}>
          <div className={styles.permissionCard}>
            <strong>Procurement Manager</strong>
            <span>Purchase planning, approvals and suppliers</span>
          </div>

          <div className={styles.permissionCard}>
            <strong>Inventory Planner</strong>
            <span>Inventory, replenishment and forecasting</span>
          </div>

          <div className={styles.permissionCard}>
            <strong>Warehouse User</strong>
            <span>Stock movement and warehouse operations</span>
          </div>

          <div className={styles.permissionCard}>
            <strong>Finance Reviewer</strong>
            <span>Cost analysis and purchase review</span>
          </div>

          <div className={styles.permissionCard}>
            <strong>Supplier</strong>
            <span>Supplier information and order visibility</span>
          </div>
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
                popup.type === "success"
                  ? styles.successIcon
                  : popup.type === "warning"
                  ? styles.warningIcon
                  : popup.type === "permission"
                  ? styles.permissionIcon
                  : styles.errorIcon
              }`}
            >
              {popup.type === "success"
                ? "✓"
                : popup.type === "warning"
                ? "!"
                : popup.type === "permission"
                ? "!"
                : "×"}
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

export default Users;