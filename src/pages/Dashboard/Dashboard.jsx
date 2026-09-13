import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionPopup, setPermissionPopup] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
    result.message || "Unable to fetch dashboard data."
  );
}
        setDashboardData(result.data);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (permissionPopup) {
    return (
      <div className={styles.dashboard}>
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
              You do not have permission to access dashboard.
            </p>

            <button
              type="button"
              className={styles.popupButton}
              onClick={() =>
                navigate("/login", { replace: true })
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
      <div className={styles.dashboard}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { kpis, demandData, inventoryData, alerts } = dashboardData;

  const maxDemand = Math.max(
    ...demandData.flatMap((item) => [
      item.actual,
      item.forecast,
    ])
  );

  const maxInventory = Math.max(
    ...inventoryData.map((item) => item.value)
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>
            Monitor demand, inventory, supply and procurement performance.
          </p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <span>Total Inventory</span>
          <strong>{kpis.totalInventory.toLocaleString()}</strong>
          <small>Units in stock</small>
        </div>

        <div className={styles.card}>
          <span>Forecast Demand</span>
          <strong>{kpis.forecastDemand.toLocaleString()}</strong>
          <small>Next 30 days</small>
        </div>

        <div className={styles.card}>
          <span>Low Stock Items</span>
          <strong>{kpis.lowStockItems}</strong>
          <small>Needs attention</small>
        </div>

        <div className={styles.card}>
          <span>Stockout Risk</span>
          <strong>{kpis.stockoutRisk}</strong>
          <small>Critical items</small>
        </div>

        <div className={styles.card}>
          <span>Excess Inventory</span>
          <strong>{kpis.excessInventory}</strong>
          <small>Items above target</small>
        </div>

        <div className={styles.card}>
          <span>Open Orders</span>
          <strong>{kpis.openOrders}</strong>
          <small>Purchase orders</small>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <h2>Demand Overview</h2>

          <div className={styles.chart}>
            <div className={styles.legend}>
              <span>Actual Demand</span>
              <span>Forecast Demand</span>
            </div>

            <div className={styles.barChart}>
              {demandData.map((item) => (
                <div
                  className={styles.barGroup}
                  key={item.month}
                >
                  <div className={styles.bars}>
                    <div
                      className={styles.actualBar}
                      style={{
                        height: `${
                          (item.actual / maxDemand) * 180
                        }px`,
                      }}
                      title={`Actual: ${item.actual}`}
                    />

                    <div
                      className={styles.forecastBar}
                      style={{
                        height: `${
                          (item.forecast / maxDemand) * 180
                        }px`,
                      }}
                      title={`Forecast: ${item.forecast}`}
                    />
                  </div>

                  <span>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Inventory Status</h2>

          <div className={styles.inventoryChart}>
            {inventoryData.map((item) => (
              <div
                className={styles.inventoryRow}
                key={item.name}
              >
                <div className={styles.inventoryLabel}>
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                </div>

                <div
                  className={
                    styles.inventoryBarBackground
                  }
                >
                  <div
                    className={styles.inventoryBar}
                    style={{
                      width: `${
                        (item.value / maxInventory) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.panel}>
        <h2>Critical Alerts</h2>

        {alerts.map((alert) => (
          <div
            className={styles.alert}
            key={alert.id}
          >
            <strong>{alert.type}</strong>
            <span>{alert.message}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;