import { useEffect, useState } from "react";
import styles from "./Forecasting.module.css";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

function Forecasting() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [search, setSearch] = useState("");
  const [forecastData, setForecastData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionPopup, setPermissionPopup] = useState(false);

  useEffect(() => {
    const fetchForecasting = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/forecasting`,
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
            result.message || "Unable to fetch forecasting data."
          );
        }

        setForecastData(result.data.forecastData);
        setKpis(result.data.kpis);
      } catch (error) {
        console.error("Forecasting error:", error);
        setError("Unable to load forecasting data.");
      } finally {
        setLoading(false);
      }
    };

    fetchForecasting();
  }, [navigate]);

  if (permissionPopup) {
    return (
      <div className={styles.forecasting}>
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
              You do not have permission to access forecasting.
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
      <div className={styles.forecasting}>
        Loading forecasting...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.forecasting}>
        {error}
      </div>
    );
  }

  if (!kpis) {
    return null;
  }

  const filteredData = forecastData.filter((item) =>
    item.item.toLowerCase().includes(search.toLowerCase())
  );

  const categorySummary = forecastData.reduce(
    (summary, item) => {
      const category = item.category || "Other";

      if (!summary[category]) {
        summary[category] = {
          category,
          items: 0,
          forecast: 0,
          currentStock: 0,
          atRisk: 0,
        };
      }

      summary[category].items += 1;
      summary[category].forecast += Number(item.forecast || 0);
      summary[category].currentStock += Number(
        item.currentStock || 0
      );

      if (
        item.risk === "Critical" ||
        item.risk === "Excess"
      ) {
        summary[category].atRisk += 1;
      }

      return summary;
    },
    {}
  );

  const categoryData = Object.values(categorySummary);

  const getForecastState = (item) => {
    const forecast = Number(item.forecast || 0);
    const currentStock = Number(item.currentStock || 0);

    if (item.risk === "Critical") {
      return "Stockout Risk";
    }

    if (item.risk === "Excess") {
      return "Excess Stock";
    }

    if (forecast > currentStock) {
      return "Demand Above Stock";
    }

    return "Balanced";
  };

  const getForecastStateClass = (state) => {
    if (
      state === "Stockout Risk" ||
      state === "Demand Above Stock"
    ) {
      return styles.critical;
    }

    if (state === "Excess Stock") {
      return styles.excess;
    }

    return styles.low;
  };

  return (
    <div className={styles.forecasting}>
      <div className={styles.pageHeader}>
        <h1>Forecasting</h1>

        <p>
          View demand forecasts, confidence levels and inventory risk.
        </p>
      </div>

      {/* =========================
          FORECAST KPIs
      ========================= */}

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <span>Forecast Horizon</span>
          <strong>{kpis.forecastHorizon} Days</strong>
          <small>Current planning period</small>
        </div>

        <div className={styles.card}>
          <span>Forecast Demand</span>
          <strong>
            {kpis.forecastDemand.toLocaleString()}
          </strong>
          <small>Expected demand</small>
        </div>

        <div className={styles.card}>
          <span>High Confidence</span>
          <strong>{kpis.highConfidence}%</strong>
          <small>Forecast reliability</small>
        </div>

        <div className={styles.card}>
          <span>At Risk</span>
          <strong>{kpis.atRisk}</strong>
          <small>Items requiring attention</small>
        </div>
      </div>

      {/* =========================
          DEMAND FORECAST
      ========================= */}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Demand Forecast</h2>

            <p>
              AI-assisted forecast based on historical demand,
              seasonality and current inventory.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Forecast Demand</th>
                <th>Current Stock</th>
                <th>Confidence</th>
                <th>Risk</th>
                <th>Forecast State</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => {
                const forecastState = getForecastState(item);

                return (
                  <tr key={item.id}>
                    <td>{item.item}</td>

                    <td>{item.category}</td>

                    <td>
                      {Number(
                        item.forecast || 0
                      ).toLocaleString()}
                    </td>

                    <td>
                      {Number(
                        item.currentStock || 0
                      ).toLocaleString()}
                    </td>

                    <td>
                      <span
                        className={
                          item.confidence === "High"
                            ? styles.high
                            : styles.medium
                        }
                      >
                        {item.confidence}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          item.risk === "Critical"
                            ? styles.critical
                            : item.risk === "Excess"
                              ? styles.excess
                              : styles.low
                        }
                      >
                        {item.risk}
                      </span>
                    </td>

                    <td>
                      <span
                        className={getForecastStateClass(
                          forecastState
                        )}
                      >
                        {forecastState}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className={styles.noResults}
                  >
                    No forecast records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================
          CATEGORY FORECAST SUMMARY
      ========================= */}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Forecast by Category</h2>

            <p>
              Demand outlook across the major inventory categories.
            </p>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Items</th>
                <th>Forecast Demand</th>
                <th>Current Stock</th>
                <th>Demand Gap</th>
                <th>At Risk</th>
              </tr>
            </thead>

            <tbody>
              {categoryData.map((category) => {
                const demandGap =
                  category.forecast -
                  category.currentStock;

                return (
                  <tr key={category.category}>
                    <td>{category.category}</td>

                    <td>{category.items}</td>

                    <td>
                      {category.forecast.toLocaleString()}
                    </td>

                    <td>
                      {category.currentStock.toLocaleString()}
                    </td>

                    <td>
                      <span
                        className={
                          demandGap > 0
                            ? styles.critical
                            : styles.low
                        }
                      >
                        {demandGap > 0 ? "+" : ""}
                        {demandGap.toLocaleString()}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          category.atRisk > 0
                            ? styles.warning
                            : styles.low
                        }
                      >
                        {category.atRisk}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {categoryData.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className={styles.noResults}
                  >
                    No category forecast data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================
          AI FORECAST DETAILS
      ========================= */}

      {settings.aiRecommendations && (
        <section className={styles.panel}>
          <h2>AI Forecast Details</h2>

          <div className={styles.inputGrid}>
            <div className={styles.inputCard}>
              <strong>Historical Demand</strong>
              <span>Previous 12 months</span>
            </div>

            <div className={styles.inputCard}>
              <strong>Seasonality</strong>
              <span>Academic calendar patterns</span>
            </div>

            <div className={styles.inputCard}>
              <strong>Enrolment</strong>
              <span>Current student count</span>
            </div>

            <div className={styles.inputCard}>
              <strong>Lead Time</strong>
              <span>Supplier delivery estimates</span>
            </div>
          </div>

          {forecastData.length > 0 && (
            <div className={styles.aiDetails}>
              <h3>Forecast Explanation</h3>

              {forecastData.map((item) => (
                <div
                  key={item.id}
                  className={styles.aiDetailCard}
                >
                  <div>
                    <strong>{item.item}</strong>
                    <span>{item.explanation}</span>
                  </div>

                  <div>
                    <span>Category</span>
                    <strong>{item.category}</strong>
                  </div>

                  <div>
                    <span>Forecast Demand</span>
                    <strong>{item.forecast}</strong>
                  </div>

                  <div>
                    <span>Confidence</span>
                    <strong>{item.confidence}</strong>
                  </div>

                  <div>
                    <span>Risk</span>
                    <strong>{item.risk}</strong>
                  </div>

                  <div>
                    <span>Model Version</span>
                    <strong>{item.modelVersion}</strong>
                  </div>

                  <div>
                    <span>Current Stock</span>
                    <strong>
                      {item.sourceData.currentStock}
                    </strong>
                  </div>

                  <div>
                    <span>Safety Stock</span>
                    <strong>
                      {item.sourceData.safetyStock}
                    </strong>
                  </div>

                  <div>
                    <span>Lead Time</span>
                    <strong>
                      {item.sourceData.leadTime} Days
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.modelInfo}>
            <span>Model Version</span>

            <strong>
              {forecastData[0]?.modelVersion ||
                "Demand-Forecast-v1.2"}
            </strong>

            <span>Last Updated</span>

            <strong>
              {forecastData[0]?.forecastTimestamp
                ? new Date(
                    forecastData[0].forecastTimestamp
                  ).toLocaleString()
                : "Not available"}
            </strong>
          </div>
        </section>
      )}
    </div>
  );
}

export default Forecasting;