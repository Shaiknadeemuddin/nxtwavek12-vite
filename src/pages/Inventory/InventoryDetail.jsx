import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./InventoryDetail.module.css";

function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
       const token = localStorage.getItem("token");

const response = await fetch(
  `${import.meta.env.VITE_API_URL}/inventory/${id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to fetch inventory item."
          );
        }

        setItem(result.data);
      } catch (error) {
        console.error("Inventory detail error:", error);
        setError("Unable to load inventory item.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.detail}>
        Loading inventory details...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.detail}>
        <p>{error}</p>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/dashboard/inventory")}
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.detail}>
        <p>Inventory item not found.</p>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/dashboard/inventory")}
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  const formatExpiryDate = (date) => {
    if (!date) {
      return "No expiry";
    }

    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className={styles.detail}>
      <div className={styles.pageHeader}>
        <div>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/dashboard/inventory")}
          >
            ← Back to Inventory
          </button>

          <h1>{item.item}</h1>

          <p>
            {item.category} • {item.location}
          </p>
        </div>
      </div>

      <div className={styles.statusRow}>
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
      </div>

      <div className={styles.cardGrid}>
        <section className={styles.card}>
          <h2>Stock Information</h2>

          <div className={styles.infoGrid}>
            <div>
              <span>Current Stock</span>
              <strong>{item.stock.toLocaleString()}</strong>
            </div>

            <div>
              <span>Safety Stock</span>
              <strong>{item.safetyStock.toLocaleString()}</strong>
            </div>

            <div>
              <span>Reserved Quantity</span>
              <strong>
                {item.reservedQuantity.toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Open Orders</span>
              <strong>{item.openOrders.toLocaleString()}</strong>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2>Inventory Details</h2>

          <div className={styles.infoGrid}>
            <div>
              <span>Location</span>
              <strong>{item.location}</strong>
            </div>

            <div>
              <span>Lot / Batch</span>
              <strong>{item.lotBatch}</strong>
            </div>

            <div>
              <span>Age</span>
              <strong>{item.age} days</strong>
            </div>

            <div>
              <span>Expiry Date</span>
              <strong>
                {formatExpiryDate(item.expiryDate)}
              </strong>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2>Planning Information</h2>

          <div className={styles.infoGrid}>
            <div>
              <span>Lead Time</span>
              <strong>{item.leadTime} days</strong>
            </div>

            <div>
              <span>Forecast Demand</span>
              <strong>
                {item.forecastDemand.toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Available Stock</span>
              <strong>
                {Math.max(
                  item.stock - item.reservedQuantity,
                  0
                ).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Stock vs Safety</span>
              <strong>
                {item.stock >= item.safetyStock
                  ? "Above Safety Stock"
                  : "Below Safety Stock"}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default InventoryDetail;