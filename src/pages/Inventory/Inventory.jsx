import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Inventory.module.css";

function Inventory() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissionPopup, setPermissionPopup] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/inventory`,
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
            result.message || "Unable to fetch inventory data."
          );
        }

        setInventoryData(result.data.inventoryData);
        setKpis(result.data.kpis);
      } catch (error) {
        console.error("Inventory error:", error);
        setError("Unable to load inventory data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [navigate]);

  if (permissionPopup) {
    return (
      <div className={styles.inventory}>
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
              You do not have permission to access inventory.
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
      <div className={styles.inventory}>
        Loading inventory...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.inventory}>
        {error}
      </div>
    );
  }

  if (!kpis) {
    return null;
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("asc");
    }

    setCurrentPage(1);
  };

  const getSortValue = (item, field) => {
    if (field === "stock" || field === "safetyStock") {
      return Number(item[field]);
    }

    return String(item[field] || "").toLowerCase();
  };

  const filteredInventory = inventoryData.filter((item) => {
    const matchesSearch = item.item
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      !categoryFilter || item.category === categoryFilter;

    const matchesLocation =
      !locationFilter || item.location === locationFilter;

    const matchesStatus =
      !statusFilter || item.status === statusFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesStatus
    );
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (!sortField) {
      return 0;
    }

    const valueA = getSortValue(a, sortField);
    const valueB = getSortValue(b, sortField);

    if (valueA < valueB) {
      return sortOrder === "asc" ? -1 : 1;
    }

    if (valueA > valueB) {
      return sortOrder === "asc" ? 1 : -1;
    }

    return 0;
  });

  const totalPages = Math.ceil(
    sortedInventory.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedInventory = sortedInventory.slice(
    startIndex,
    endIndex
  );

  const handlePrevious = () => {
    setCurrentPage((current) => Math.max(current - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((current) =>
      Math.min(current + 1, totalPages)
    );
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return "↕";
    }

    return sortOrder === "asc" ? "↑" : "↓";
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setLocationFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const categories = [
    ...new Set(inventoryData.map((item) => item.category)),
  ];

  const locations = [
    ...new Set(inventoryData.map((item) => item.location)),
  ];

  const statuses = [
    ...new Set(inventoryData.map((item) => item.status)),
  ];

  const hasFilters =
    search ||
    categoryFilter ||
    locationFilter ||
    statusFilter;

  /* =========================
     ALLOCATION VIEW
  ========================= */

  const buildAllocationData = () => {
    const groupedItems = {};

    inventoryData.forEach((item) => {
      if (!groupedItems[item.item]) {
        groupedItems[item.item] = [];
      }

      groupedItems[item.item].push(item);
    });

    const allocations = [];

    Object.values(groupedItems).forEach((items) => {
      const surplusLocations = items
        .map((item) => ({
          ...item,
          surplus: Math.max(
            Number(item.stock || 0) -
              Number(item.safetyStock || 0),
            0
          ),
        }))
        .filter((item) => item.surplus > 0)
        .sort((a, b) => b.surplus - a.surplus);

      const shortageLocations = items
        .map((item) => ({
          ...item,
          shortage: Math.max(
            Number(item.safetyStock || 0) -
              Number(item.stock || 0),
            0
          ),
        }))
        .filter((item) => item.shortage > 0)
        .sort((a, b) => b.shortage - a.shortage);

      shortageLocations.forEach((target) => {
        let remainingShortage = target.shortage;

        for (const source of surplusLocations) {
          if (remainingShortage <= 0) {
            break;
          }

          if (source.surplus <= 0) {
            continue;
          }

          const recommendedQuantity = Math.min(
            source.surplus,
            remainingShortage
          );

          if (recommendedQuantity > 0) {
            allocations.push({
              id: `${source._id}-${target._id}`,
              item: target.item,
              category: target.category,
              sourceLocation: source.location,
              targetLocation: target.location,
              availableStock: source.stock,
              targetStock: target.stock,
              targetSafetyStock: target.safetyStock,
              recommendedQuantity,
              status: "Transfer Recommended",
            });

            source.surplus -= recommendedQuantity;
            remainingShortage -= recommendedQuantity;
          }
        }

        if (remainingShortage > 0) {
          allocations.push({
            id: `${target._id}-purchase`,
            item: target.item,
            category: target.category,
            sourceLocation: "External Supplier",
            targetLocation: target.location,
            availableStock: 0,
            targetStock: target.stock,
            targetSafetyStock: target.safetyStock,
            recommendedQuantity: remainingShortage,
            status: "Purchase Required",
          });
        }
      });
    });

    return allocations;
  };

  const allocationData = buildAllocationData();

  return (
    <div className={styles.inventory}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Inventory</h1>
          <p>
            Monitor stock levels, locations, lots, ageing and inventory risk.
          </p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <span>Total Items</span>
          <strong>{kpis.totalItems.toLocaleString()}</strong>
          <small>Across all locations</small>
        </div>

        <div className={styles.card}>
          <span>Total Stock</span>
          <strong>{kpis.totalStock.toLocaleString()}</strong>
          <small>Units in inventory</small>
        </div>

        <div className={styles.card}>
          <span>Low Stock</span>
          <strong>{kpis.lowStock}</strong>
          <small>Items below safety stock</small>
        </div>

        <div className={styles.card}>
          <span>Expiring Soon</span>
          <strong>{kpis.expiringSoon}</strong>
          <small>Within 30 days</small>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Inventory Items</h2>

          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={handleSearchChange}
            className={styles.search}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
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
            onChange={handleLocationChange}
          >
            <option value="">All Locations</option>

            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
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

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("item")}
                  >
                    Item {getSortIcon("item")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("category")}
                  >
                    Category {getSortIcon("category")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("location")}
                  >
                    Location {getSortIcon("location")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("stock")}
                  >
                    Stock {getSortIcon("stock")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("safetyStock")}
                  >
                    Safety Stock {getSortIcon("safetyStock")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("status")}
                  >
                    Status {getSortIcon("status")}
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedInventory.map((item) => (
                <tr key={item._id}>
                  <td>
                    <button
                      type="button"
                      className={styles.itemButton}
                      onClick={() =>
                        navigate(
                          `/dashboard/inventory/${item._id}`
                        )
                      }
                    >
                      {item.item}
                    </button>
                  </td>

                  <td>{item.category}</td>
                  <td>{item.location}</td>
                  <td>{item.stock}</td>
                  <td>{item.safetyStock}</td>

                  <td>
                    <span
                      className={
                        item.status === "Normal"
                          ? styles.normal
                          : item.status === "Warning"
                            ? styles.warning
                            : styles.critical
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {sortedInventory.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.noResults}>
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sortedInventory.length > 0 && (
          <div className={styles.pagination}>
            <span>
              Showing {startIndex + 1}-
              {Math.min(endIndex, sortedInventory.length)} of{" "}
              {sortedInventory.length} items
            </span>

            <div className={styles.paginationControls}>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =========================
          ALLOCATION VIEW
      ========================= */}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Allocation View</h2>
            <p>
              Recommended stock transfers between locations based
              on available stock and safety-stock requirements.
            </p>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Source Location</th>
                <th>Target Location</th>
                <th>Available Stock</th>
                <th>Target Stock</th>
                <th>Safety Stock</th>
                <th>Recommended Qty</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {allocationData.map((allocation) => (
                <tr key={allocation.id}>
                  <td>{allocation.item}</td>

                  <td>{allocation.category}</td>

                  <td>{allocation.sourceLocation}</td>

                  <td>{allocation.targetLocation}</td>

                  <td>{allocation.availableStock}</td>

                  <td>{allocation.targetStock}</td>

                  <td>{allocation.targetSafetyStock}</td>

                  <td>
                    <strong>
                      {allocation.recommendedQuantity}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={
                        allocation.status ===
                        "Transfer Recommended"
                          ? styles.normal
                          : styles.warning
                      }
                    >
                      {allocation.status}
                    </span>
                  </td>
                </tr>
              ))}

              {allocationData.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className={styles.noResults}
                  >
                    No allocation recommendations available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Inventory;