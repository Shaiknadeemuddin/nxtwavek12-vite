import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PurchasePlanning.module.css";
import { useSettings } from "../../context/SettingsContext";

function PurchasePlanning() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [search, setSearch] = useState("");
  const [purchaseData, setPurchaseData] = useState([]);

  const [kpis, setKpis] = useState({
    purchaseRecommendations: 0,
    pendingApproval: 0,
    recommendedUnits: 0,
    estimatedSpend: 0,
  });

  const [summary, setSummary] = useState({
    criticalPurchases: 0,
    highPriority: 0,
    approved: 0,
    planningCycle: 30,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [approveItem, setApproveItem] = useState(null);

  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [deferItem, setDeferItem] = useState(null);
  const [deferReason, setDeferReason] = useState("");

  const [overrideItem, setOverrideItem] = useState(null);
  const [overrideQuantity, setOverrideQuantity] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const [permissionPopup, setPermissionPopup] = useState(false);

  /* =========================
     SUPPLIER SCORECARDS
  ========================= */

  const supplierScorecards = [
    {
      supplier: "Academic Publishers",
      onTimeDelivery: 94,
      qualityScore: 92,
      leadTime: 7,
      reliability: "High",
      risk: "Low",
      overallScore: 93,
    },
    {
      supplier: "Lab Equipment Co.",
      onTimeDelivery: 88,
      qualityScore: 90,
      leadTime: 10,
      reliability: "High",
      risk: "Low",
      overallScore: 89,
    },
    {
      supplier: "Uniform Suppliers Ltd.",
      onTimeDelivery: 82,
      qualityScore: 86,
      leadTime: 14,
      reliability: "Medium",
      risk: "Medium",
      overallScore: 84,
    },
    {
      supplier: "Stationery Hub",
      onTimeDelivery: 91,
      qualityScore: 88,
      leadTime: 5,
      reliability: "High",
      risk: "Low",
      overallScore: 90,
    },
  ];

  /* =========================
     FETCH PURCHASE PLANNING
  ========================= */

  const fetchPurchasePlanning = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/purchase-planning`,
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
          result.message ||
            "Unable to fetch purchase planning data."
        );
      }

      setPurchaseData(result.data.purchaseData);
      setKpis(result.data.kpis);
      setSummary(result.data.summary);
    } catch (error) {
      console.error("Purchase planning fetch error:", error);
      setError("Unable to load purchase planning data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasePlanning();
  }, []);

  /* =========================
     FILTERS
  ========================= */

  const categories = [
    ...new Set(
      purchaseData.map((item) => item.category).filter(Boolean)
    ),
  ];

  const suppliers = [
    ...new Set(
      purchaseData.map((item) => item.supplier).filter(Boolean)
    ),
  ];

  const priorities = [
    ...new Set(
      purchaseData.map((item) => item.priority).filter(Boolean)
    ),
  ];

  const statuses = [
    ...new Set(
      purchaseData.map((item) => item.status).filter(Boolean)
    ),
  ];

  const filteredData = purchaseData.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.item.toLowerCase().includes(searchText) ||
      item.supplier.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText);

    const matchesCategory =
      !categoryFilter || item.category === categoryFilter;

    const matchesSupplier =
      !supplierFilter || item.supplier === supplierFilter;

    const matchesPriority =
      !priorityFilter || item.priority === priorityFilter;

    const matchesStatus =
      !statusFilter || item.status === statusFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSupplier &&
      matchesPriority &&
      matchesStatus
    );
  });

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setSupplierFilter("");
    setPriorityFilter("");
    setStatusFilter("");
  };

  const hasFilters =
    search ||
    categoryFilter ||
    supplierFilter ||
    priorityFilter ||
    statusFilter;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  /* =========================
     APPROVE
  ========================= */

  const handleApproveClick = (item) => {
    setApproveItem(item);
  };

  const handleApproveConfirm = async () => {
    if (!approveItem) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/purchase-planning/${approveItem._id}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            reviewedBy: "Inventory Planner",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to approve recommendation."
        );
      }

      setPurchaseData((currentData) =>
        currentData.map((item) =>
          item._id === approveItem._id
            ? {
                ...item,
                status: "Approved",
                reviewedBy: result.data.reviewedBy,
                reviewedAt: result.data.reviewedAt,
                rejectionReason: "",
              }
            : item
        )
      );

      setSummary((currentSummary) => ({
        ...currentSummary,
        approved: currentSummary.approved + 1,
      }));

      setKpis((currentKpis) => ({
        ...currentKpis,
        pendingApproval:
          currentKpis.pendingApproval > 0
            ? currentKpis.pendingApproval - 1
            : 0,
        purchaseRecommendations:
          currentKpis.purchaseRecommendations > 0
            ? currentKpis.purchaseRecommendations - 1
            : 0,
      }));

      setApproveItem(null);

      window.alert(
        "Purchase recommendation approved successfully."
      );
    } catch (error) {
      console.error("Approve error:", error);
      window.alert("Unable to approve purchase recommendation.");
    }
  };

  /* =========================
     REJECT
  ========================= */

  const handleRejectClick = (item) => {
    setRejectItem(item);
    setRejectReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectItem) {
      return;
    }

    if (!rejectReason.trim()) {
      window.alert("Please enter a rejection reason.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/purchase-planning/${rejectItem._id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            reason: rejectReason.trim(),
            reviewedBy: "Inventory Planner",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to reject recommendation."
        );
      }

      setPurchaseData((currentData) =>
        currentData.map((item) =>
          item._id === rejectItem._id
            ? {
                ...item,
                status: "Rejected",
                rejectionReason: result.data.rejectionReason,
                reviewedBy: result.data.reviewedBy,
                reviewedAt: result.data.reviewedAt,
              }
            : item
        )
      );

      setKpis((currentKpis) => ({
        ...currentKpis,
        pendingApproval:
          currentKpis.pendingApproval > 0
            ? currentKpis.pendingApproval - 1
            : 0,
        purchaseRecommendations:
          currentKpis.purchaseRecommendations > 0
            ? currentKpis.purchaseRecommendations - 1
            : 0,
      }));

      setRejectItem(null);
      setRejectReason("");

      window.alert(
        "Purchase recommendation rejected successfully."
      );
    } catch (error) {
      console.error("Reject error:", error);
      window.alert("Unable to reject purchase recommendation.");
    }
  };

  /* =========================
     DEFER
  ========================= */

  const handleDeferClick = (item) => {
    setDeferItem(item);
    setDeferReason("");
  };

  const handleDeferSubmit = async () => {
    if (!deferItem) {
      return;
    }

    if (!deferReason.trim()) {
      window.alert("Please enter a defer reason.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/purchase-planning/${deferItem._id}/defer`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            reason: deferReason.trim(),
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
          setDeferItem(null);
          setDeferReason("");
          setPermissionPopup(true);
          return;
        }

        throw new Error(
          result.message || "Unable to defer recommendation."
        );
      }

      setPurchaseData((currentData) =>
        currentData.map((item) =>
          item._id === deferItem._id
            ? {
                ...item,
                status: result.data.status,
                deferReason: result.data.deferReason,
                reviewedBy: result.data.reviewedBy,
                reviewedAt: result.data.reviewedAt,
              }
            : item
        )
      );

      setKpis((currentKpis) => ({
        ...currentKpis,
        pendingApproval:
          deferItem.status === "Pending Review" &&
          currentKpis.pendingApproval > 0
            ? currentKpis.pendingApproval - 1
            : currentKpis.pendingApproval,
        purchaseRecommendations:
          currentKpis.purchaseRecommendations > 0
            ? currentKpis.purchaseRecommendations - 1
            : 0,
      }));

      setDeferItem(null);
      setDeferReason("");

      window.alert(
        "Purchase recommendation deferred successfully."
      );
    } catch (error) {
      console.error("Defer error:", error);
      window.alert("Unable to defer purchase recommendation.");
    }
  };

  /* =========================
     OVERRIDE
  ========================= */

  const handleOverrideClick = (item) => {
    setOverrideItem(item);
    setOverrideQuantity(item.quantity);
    setOverrideReason("");
  };

  const handleOverrideSubmit = async () => {
    if (!overrideItem) {
      return;
    }

    if (
      overrideQuantity === "" ||
      Number(overrideQuantity) < 0
    ) {
      window.alert("Please enter a valid purchase quantity.");
      return;
    }

    if (!overrideReason.trim()) {
      window.alert("Please enter an override reason.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/purchase-planning/${overrideItem._id}/override`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            quantity: Number(overrideQuantity),
            reason: overrideReason.trim(),
            reviewedBy: "Inventory Planner",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setOverrideItem(null);
          setOverrideQuantity("");
          setOverrideReason("");
          setPermissionPopup(true);
          return;
        }

        throw new Error(
          result.message ||
            "Unable to override recommendation."
        );
      }

      setPurchaseData((currentData) =>
        currentData.map((item) =>
          item._id === overrideItem._id
            ? {
                ...item,
                quantity: result.data.quantity,
                totalCost: result.data.totalCost,
                status: result.data.status,
                originalQuantity:
                  result.data.originalQuantity,
                overrideReason:
                  result.data.overrideReason,
                reviewedBy: result.data.reviewedBy,
                reviewedAt: result.data.reviewedAt,
              }
            : item
        )
      );

      setOverrideItem(null);
      setOverrideQuantity("");
      setOverrideReason("");

      window.alert(
        "Purchase recommendation overridden successfully."
      );
    } catch (error) {
      console.error("Override error:", error);
    }
  };
  /* =========================
     LOADING / ERROR
  ========================= */

  if (loading) {
    if (permissionPopup) {
      return (
        <div className={styles.purchasePlanning}>
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

              <h3 id="permission-title">
                Access Denied
              </h3>

              <p>
                You do not have permission to access purchase
                planning.
              </p>

              <button
                type="button"
                className={styles.popupButton}
                onClick={() =>
                  navigate("/dashboard", {
                    replace: true,
                  })
                }
              >
                OK
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.purchasePlanning}>
        <div className={styles.pageHeader}>
          <h1>Purchase Planning</h1>
          <p>Loading purchase planning data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.purchasePlanning}>
        <div className={styles.pageHeader}>
          <h1>Purchase Planning</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.purchasePlanning}>
      <div className={styles.pageHeader}>
        <h1>Purchase Planning</h1>

        <p>
          Review, approve and manage AI-assisted purchase
          recommendations.
        </p>
      </div>

      {/* =========================
          KPI
      ========================= */}

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <span>Purchase Recommendations</span>
          <strong>{kpis.purchaseRecommendations}</strong>
          <small>Pending planning decisions</small>
        </div>

        <div className={styles.card}>
          <span>Pending Approval</span>
          <strong>{kpis.pendingApproval}</strong>
          <small>Require review</small>
        </div>

        <div className={styles.card}>
          <span>Recommended Units</span>
          <strong>
            {kpis.recommendedUnits.toLocaleString("en-IN")}
          </strong>
          <small>Total purchase quantity</small>
        </div>

        <div className={styles.card}>
          <span>Estimated Spend</span>
          <strong>
            {formatCurrency(kpis.estimatedSpend)}
          </strong>
          <small>Projected purchase cost</small>
        </div>
      </div>

      {/* =========================
          PURCHASE RECOMMENDATIONS
      ========================= */}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Purchase Recommendations</h2>

            <p>
              AI-generated recommendations based on demand,
              stock levels, safety stock and supplier lead time.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search items or suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
        </div>

        {/* FILTERS */}

        <div className={styles.filters}>
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={supplierFilter}
            onChange={(e) =>
              setSupplierFilter(e.target.value)
            }
          >
            <option value="">All Suppliers</option>

            {suppliers.map((supplier) => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
          >
            <option value="">All Priorities</option>

            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="">All Statuses</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
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

        {/* TABLE */}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Quantity</th>
                <th>Estimated Cost</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => (
                <tr key={item._id}>
                  <td className={styles.itemName}>
                    {item.item}
                  </td>

                  <td>{item.category}</td>

                  <td>{item.supplier}</td>

                  <td>{item.quantity}</td>

                  <td>
                    {formatCurrency(item.totalCost)}
                  </td>

                  <td>
                    <span
                      className={
                        item.priority === "Critical"
                          ? styles.critical
                          : item.priority === "High"
                            ? styles.high
                            : item.priority === "Medium"
                              ? styles.medium
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
                          : item.status === "Approved"
                            ? styles.approved
                            : item.status === "Rejected"
                              ? styles.critical
                              : item.status === "Deferred"
                                ? styles.medium
                                : item.status === "Overridden"
                                  ? styles.high
                                  : styles.recommended
                      }
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    {item.status === "Pending Review" ||
                    item.status === "Recommended" ? (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.approveButton}
                          onClick={() =>
                            handleApproveClick(item)
                          }
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className={styles.rejectButton}
                          onClick={() =>
                            handleRejectClick(item)
                          }
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          className={styles.overrideButton}
                          onClick={() =>
                            handleDeferClick(item)
                          }
                        >
                          Defer
                        </button>

                        <button
                          type="button"
                          className={styles.overrideButton}
                          onClick={() =>
                            handleOverrideClick(item)
                          }
                        >
                          Override
                        </button>
                      </div>
                    ) : item.status === "Approved" ||
                      item.status === "Rejected" ? (
                      <button
                        type="button"
                        className={styles.overrideButton}
                        onClick={() =>
                          handleOverrideClick(item)
                        }
                      >
                        Override
                      </button>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className={styles.noResults}
                  >
                    No purchase recommendations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================
          AI RECOMMENDATION DETAILS
      ========================= */}

      {settings.aiRecommendations && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>AI Recommendation Details</h2>

              <p>
                Review the data, confidence and explanation behind
                each purchase recommendation.
              </p>
            </div>
          </div>

          <div className={styles.inputGrid}>
            {filteredData.map((item) => (
              <div
                key={item._id}
                className={styles.inputCard}
              >
                <strong>{item.item}</strong>

                <span>
                  <b>Recommended Action:</b>{" "}
                  {item.recommendedAction ||
                    "Review purchase recommendation"}
                </span>

                <span>
                  <b>Confidence:</b>{" "}
                  {item.confidence || "Medium"}
                </span>

                <span>
                  <b>Explanation:</b>{" "}
                  {item.explanation ||
                    "Purchase recommendation generated from inventory planning inputs."}
                </span>

                <span>
                  <b>Current Stock:</b>{" "}
                  {item.sourceData?.currentStock ?? 0}
                </span>

                <span>
                  <b>Safety Stock:</b>{" "}
                  {item.sourceData?.safetyStock ?? 0}
                </span>

                <span>
                  <b>Forecast Demand:</b>{" "}
                  {item.sourceData?.forecastDemand ?? 0}
                </span>

                <span>
                  <b>Lead Time:</b>{" "}
                  {item.sourceData?.leadTime ?? 0} Days
                </span>

                <span>
                  <b>Open Orders:</b>{" "}
                  {item.sourceData?.openOrders ?? 0}
                </span>

                <span>
                  <b>Reserved Quantity:</b>{" "}
                  {item.sourceData?.reservedQuantity ?? 0}
                </span>

                <span>
                  <b>Model Version:</b>{" "}
                  {item.modelVersion ||
                    "Purchase-Recommendation-v1.0"}
                </span>

                <span>
                  <b>Generated At:</b>{" "}
                  {item.generatedAt
                    ? new Date(
                        item.generatedAt
                      ).toLocaleString()
                    : "Not available"}
                </span>

                {item.status === "Overridden" && (
                  <span>
                    <b>Override Reason:</b>{" "}
                    {item.overrideReason || "Not provided"}
                  </span>
                )}

                {item.status === "Rejected" && (
                  <span>
                    <b>Rejection Reason:</b>{" "}
                    {item.rejectionReason || "Not provided"}
                  </span>
                )}

                {item.status === "Deferred" && (
                  <span>
                    <b>Defer Reason:</b>{" "}
                    {item.deferReason || "Not provided"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================
          PLANNING SUMMARY
      ========================= */}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Planning Summary</h2>

            <p>
              Overview of the current purchase planning cycle.
            </p>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Critical Purchases</span>
            <strong>{summary.criticalPurchases}</strong>
            <small>Require immediate attention</small>
          </div>

          <div className={styles.summaryCard}>
            <span>High Priority</span>
            <strong>{summary.highPriority}</strong>
            <small>Recommended this cycle</small>
          </div>

          <div className={styles.summaryCard}>
            <span>Approved</span>
            <strong>{summary.approved}</strong>
            <small>Ready for procurement</small>
          </div>

          <div className={styles.summaryCard}>
            <span>Planning Cycle</span>
            <strong>
              {summary.planningCycle} Days
            </strong>
            <small>Current planning horizon</small>
          </div>
        </div>
      </section>

      {/* =========================
          SUPPLIER SCORECARD
      ========================= */}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Supplier Scorecard</h2>

            <p>
              Compare supplier delivery performance, quality,
              lead time and reliability.
            </p>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>On-Time Delivery</th>
                <th>Quality Score</th>
                <th>Lead Time</th>
                <th>Reliability</th>
                <th>Risk</th>
                <th>Overall Score</th>
              </tr>
            </thead>

            <tbody>
              {supplierScorecards.map((supplier) => (
                <tr key={supplier.supplier}>
                  <td className={styles.itemName}>
                    {supplier.supplier}
                  </td>

                  <td>{supplier.onTimeDelivery}%</td>

                  <td>{supplier.qualityScore}%</td>

                  <td>{supplier.leadTime} Days</td>

                  <td>
                    <span
                      className={
                        supplier.reliability === "High"
                          ? styles.approved
                          : styles.medium
                      }
                    >
                      {supplier.reliability}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        supplier.risk === "Low"
                          ? styles.approved
                          : styles.medium
                      }
                    >
                      {supplier.risk}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {supplier.overallScore}/100
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* =========================
          APPROVE CONFIRMATION MODAL
      ========================= */}

      {approveItem && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-title"
        >
          <div className={styles.modal}>
            <h2 id="approve-title">
              Approve Purchase Recommendation
            </h2>

            <p>
              Are you sure you want to approve the purchase
              recommendation for{" "}
              <strong>{approveItem.item}</strong>?
            </p>

            <div className={styles.approveDetails}>
              <div>
                <span>Supplier</span>
                <strong>{approveItem.supplier}</strong>
              </div>

              <div>
                <span>Quantity</span>
                <strong>{approveItem.quantity}</strong>
              </div>

              <div>
                <span>Estimated Cost</span>
                <strong>
                  {formatCurrency(approveItem.totalCost)}
                </strong>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setApproveItem(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmApproveButton}
                onClick={handleApproveConfirm}
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          REJECT MODAL
      ========================= */}

      {rejectItem && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-title"
        >
          <div className={styles.modal}>
            <h2 id="reject-title">
              Reject Purchase Recommendation
            </h2>

            <p>
              Please provide a reason for rejecting{" "}
              <strong>{rejectItem.item}</strong>.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) =>
                setRejectReason(e.target.value)
              }
              placeholder="Enter rejection reason..."
              rows="4"
              className={styles.rejectReason}
            />

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setRejectItem(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmRejectButton}
                onClick={handleRejectSubmit}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          DEFER MODAL
      ========================= */}

      {deferItem && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="defer-title"
        >
          <div className={styles.modal}>
            <h2 id="defer-title">
              Defer Purchase Recommendation
            </h2>

            <p>
              Please provide a reason for deferring{" "}
              <strong>{deferItem.item}</strong>.
            </p>

            <textarea
              value={deferReason}
              onChange={(e) =>
                setDeferReason(e.target.value)
              }
              placeholder="Enter defer reason..."
              rows="4"
              className={styles.rejectReason}
            />

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setDeferItem(null);
                  setDeferReason("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmApproveButton}
                onClick={handleDeferSubmit}
              >
                Confirm Defer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          OVERRIDE MODAL
      ========================= */}

      {overrideItem && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="override-title"
        >
          <div className={styles.modal}>
            <h2 id="override-title">
              Override Purchase Recommendation
            </h2>

            <p>
              Change the recommended purchase quantity for{" "}
              <strong>{overrideItem.item}</strong>.
            </p>

            <div className={styles.approveDetails}>
              <div>
                <span>Original Quantity</span>
                <strong>{overrideItem.quantity}</strong>
              </div>

              <div>
                <span>Supplier</span>
                <strong>{overrideItem.supplier}</strong>
              </div>

              <div>
                <span>Unit Cost</span>
                <strong>
                  {formatCurrency(overrideItem.unitCost)}
                </strong>
              </div>
            </div>

            <label>
              <span>New Purchase Quantity</span>

              <input
                type="number"
                min="0"
                value={overrideQuantity}
                onChange={(e) =>
                  setOverrideQuantity(e.target.value)
                }
                className={styles.overrideInput}
              />
            </label>

            <label>
              <span>Override Reason</span>

              <textarea
                value={overrideReason}
                onChange={(e) =>
                  setOverrideReason(e.target.value)
                }
                placeholder="Enter reason for overriding the AI recommendation..."
                rows="4"
                className={styles.rejectReason}
              />
            </label>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setOverrideItem(null);
                  setOverrideQuantity("");
                  setOverrideReason("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmApproveButton}
                onClick={handleOverrideSubmit}
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ACCESS DENIED POPUP
      ========================= */}

      {permissionPopup && (
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

            <h3 id="permission-title">
              Access Denied
            </h3>

            <p>
              You do not have permission to override purchase
              recommendations.
            </p>

            <button
              type="button"
              className={styles.popupButton}
              onClick={() =>
                navigate("/dashboard", {
                  replace: true,
                })
              }
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchasePlanning;