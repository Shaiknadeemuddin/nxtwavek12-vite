import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Replenishment.module.css";
import { useSettings } from "../../context/SettingsContext";

function Replenishment() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [search, setSearch] = useState("");
  const [replenishmentData, setReplenishmentData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionPopup, setPermissionPopup] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    const fetchReplenishment = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/replenishment`,
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
            result.message || "Unable to fetch replenishment data."
          );
        }

        setReplenishmentData(result.data.replenishmentData);
        setKpis(result.data.kpis);
      } catch (error) {
        console.error("Replenishment error:", error);
        setError("Unable to load replenishment data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReplenishment();
  }, []);

  if (permissionPopup) {
    return (
      <div className={styles.replenishment}>
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
              You do not have permission to access replenishment.
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
      <div className={styles.replenishment}>
        Loading replenishment...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.replenishment}>
        {error}
      </div>
    );
  }

  if (!kpis) {
    return null;
  }

  const categories = [
    ...new Set(
      replenishmentData.map((item) => item.category).filter(Boolean)
    ),
  ];

  const locations = [
    ...new Set(
      replenishmentData.map((item) => item.location).filter(Boolean)
    ),
  ];

  const priorities = [
    ...new Set(
      replenishmentData.map((item) => item.priority).filter(Boolean)
    ),
  ];

  const filteredData = replenishmentData.filter((item) => {
    const matchesSearch = item.item
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      !categoryFilter || item.category === categoryFilter;

    const matchesLocation =
      !locationFilter || item.location === locationFilter;

    const matchesPriority =
      !priorityFilter || item.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesPriority
    );
  });

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setLocationFilter("");
    setPriorityFilter("");
  };

  const hasFilters =
    search ||
    categoryFilter ||
    locationFilter ||
    priorityFilter;

  return (
    <div className={styles.replenishment}>
      <div className={styles.pageHeader}>
        <h1>Replenishment</h1>

        <p>
          Review AI-assisted replenishment recommendations and stock risks.
        </p>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <span>Recommendations</span>
          <strong>{kpis.recommendations}</strong>
          <small>Awaiting review</small>
        </div>

        <div className={styles.card}>
          <span>Critical Items</span>
          <strong>{kpis.criticalItems}</strong>
          <small>Immediate action required</small>
        </div>

        <div className={styles.card}>
          <span>Recommended Units</span>
          <strong>
            {kpis.recommendedUnits.toLocaleString()}
          </strong>
          <small>Suggested replenishment</small>
        </div>

        <div className={styles.card}>
          <span>Estimated Cost</span>
          <strong>₹{kpis.estimatedCost}L</strong>
          <small>Based on recommendations</small>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Replenishment Recommendations</h2>

          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>

            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>

            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={styles.clearButton}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Location</th>
                <th>Current Stock</th>
                <th>Safety Stock</th>
                <th>Recommended Qty</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{item.item}</td>
                  <td>{item.location}</td>
                  <td>{item.currentStock}</td>
                  <td>{item.safetyStock}</td>
                  <td>{item.recommendedQty}</td>

                  <td>
                    <span
                      className={
                        item.priority === "Critical"
                          ? styles.critical
                          : item.priority === "Normal"
                            ? styles.normal
                            : styles.low
                      }
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        item.status === "Pending Review"
                          ? styles.pending
                          : item.status === "Recommended"
                            ? styles.recommended
                            : styles.noAction
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className={styles.noResults}
                  >
                    No replenishment recommendations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {settings.aiRecommendations && (
       <section className={styles.panel}>
        <h2>AI Recommendation Details</h2>

        <div className={styles.inputGrid}>
          {filteredData.map((item) => (
            <div key={item.id} className={styles.inputCard}>
              <strong>{item.item}</strong>

              <span>
                <b>Action:</b> {item.recommendedAction}
              </span>

              <span>
                <b>Confidence:</b> {item.confidence}
              </span>

              <span>
                <b>Explanation:</b> {item.explanation}
              </span>

              <span>
                <b>Current Stock:</b> {item.sourceData.currentStock}
              </span>

              <span>
                <b>Safety Stock:</b> {item.sourceData.safetyStock}
              </span>

              <span>
                <b>Lead Time:</b> {item.sourceData.leadTime} Days
              </span>

              <span>
                <b>Forecast Demand:</b> {item.sourceData.forecastDemand}
              </span>

              <span>
                <b>Model:</b> {item.modelVersion}
              </span>
            </div>
          ))}
        </div>
      </section>)}
    </div>
  );
}

export default Replenishment;