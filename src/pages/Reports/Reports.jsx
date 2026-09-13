import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Reports.module.css";

function Reports() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("All Reports");

  const [reports, setReports] = useState([]);
  const [kpis, setKpis] = useState({
    totalReports: 0,
    inventoryReports: 0,
    procurementReports: 0,
    lastGenerated: "",
    lastGeneratedTime: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionPopup, setPermissionPopup] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/reports`,
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
            result.message || "Unable to fetch reports."
          );
        }

        setReports(result.data.reportData.reports);
        setKpis(result.data.kpis);
      } catch (error) {
        console.error("Reports fetch error:", error);
        setError("Unable to load reports data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(search.toLowerCase()) ||
      report.description.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      reportType === "All Reports" || report.type === reportType;

    return matchesSearch && matchesType;
  });

  const handleExport = (reportName) => {
    window.alert(`${reportName} export started.`);
  };

  if (permissionPopup) {
    return (
      <div className={styles.reports}>
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
              You do not have permission to access reports.
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
      <div className={styles.reports}>
        <div className={styles.pageHeader}>
          <h1>Reports</h1>
          <p>Loading reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.reports}>
        <div className={styles.pageHeader}>
          <h1>Reports</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reports}>
      <div className={styles.pageHeader}>
        <h1>Reports</h1>
        <p>
          View inventory, forecasting, procurement and performance reports.
        </p>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <span>Total Reports</span>
          <strong>{kpis.totalReports}</strong>
          <small>Available reports</small>
        </div>

        <div className={styles.card}>
          <span>Inventory Reports</span>
          <strong>{kpis.inventoryReports}</strong>
          <small>Stock and inventory analysis</small>
        </div>

        <div className={styles.card}>
          <span>Procurement Reports</span>
          <strong>{kpis.procurementReports}</strong>
          <small>Purchase and supplier reports</small>
        </div>

        <div className={styles.card}>
          <span>Last Generated</span>
          <strong>{kpis.lastGenerated}</strong>
          <small>{kpis.lastGeneratedTime}</small>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Available Reports</h2>
            <p>
              Generate and export reports for operational and management
              decisions.
            </p>
          </div>

          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search}
            />

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={styles.select}
            >
              <option>All Reports</option>
              <option>Inventory</option>
              <option>Forecast</option>
              <option>Procurement</option>
              <option>Analytics</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Report</th>
                <th>Type</th>
                <th>Description</th>
                <th>Generated</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td className={styles.reportName}>
                    {report.name}
                  </td>

                  <td>
                    <span className={styles.type}>
                      {report.type}
                    </span>
                  </td>

                  <td>{report.description}</td>

                  <td>{report.generated}</td>

                  <td>
                    <span className={styles.ready}>
                      {report.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className={styles.exportButton}
                      onClick={() => handleExport(report.name)}
                    >
                      Export
                    </button>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className={styles.noResults}
                  >
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Report Categories</h2>
            <p>Key areas covered by the reporting system.</p>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          <div className={styles.categoryCard}>
            <strong>Inventory</strong>
            <span>
              Stock, ageing, expiry and stockout analysis.
            </span>
          </div>

          <div className={styles.categoryCard}>
            <strong>Forecasting</strong>
            <span>
              Demand forecasts, accuracy and risk analysis.
            </span>
          </div>

          <div className={styles.categoryCard}>
            <strong>Procurement</strong>
            <span>
              Purchases, suppliers and procurement costs.
            </span>
          </div>

          <div className={styles.categoryCard}>
            <strong>Analytics</strong>
            <span>
              Service levels, performance and recommendations.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Reports;