import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Inventory", path: "/dashboard/inventory" },
    { name: "Replenishment", path: "/dashboard/replenishment" },
    { name: "Forecasting", path: "/dashboard/forecasting" },
    { name: "Purchase Planning", path: "/dashboard/purchase-planning" },
    { name: "Reports", path: "/dashboard/reports" },
    { name: "Notifications", path: "/dashboard/notifications" },
    { name: "Users & Roles", path: "/dashboard/users" },
    { name: "Audit Logs", path: "/dashboard/audit-logs" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <aside className={styles.sidebar}>
      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? styles.active : styles.link
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;