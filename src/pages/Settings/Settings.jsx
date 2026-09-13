import { useEffect, useState } from "react";
import styles from "./Settings.module.css";
import { useSettings } from "../../context/SettingsContext";
import { useNavigate } from "react-router-dom";

function Settings() {
  const { updateSetting } = useSettings();
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [permissionPopup, setPermissionPopup] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    companyName: "",
    defaultLocation: "Hyderabad",
    planningHorizon: "30 Days",
    serviceLevel: "95%",
    notifications: true,
    emailAlerts: true,
    aiRecommendations: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const fetchSettings = async () => {
    try {
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/settings`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (response.status === 403) {
          setPermissionPopup(true);
          return;
        }

        throw new Error(
          result.message || "Unable to fetch settings."
        );
      }

      const loadedSettings = {
        companyName: result.data.companyName,
        defaultLocation: result.data.defaultLocation,
        planningHorizon: result.data.planningHorizon,
        serviceLevel: result.data.serviceLevel,
        notifications: result.data.notifications,
        emailAlerts: result.data.emailAlerts,
        aiRecommendations: result.data.aiRecommendations,
      };

      setSettings(loadedSettings);

      updateSetting("defaultLocation", loadedSettings.defaultLocation);
      updateSetting("planningHorizon", loadedSettings.planningHorizon);
      updateSetting("serviceLevel", loadedSettings.serviceLevel);
      updateSetting("notifications", loadedSettings.notifications);
      updateSetting("emailAlerts", loadedSettings.emailAlerts);
      updateSetting("aiRecommendations", loadedSettings.aiRecommendations);
    } catch (error) {
      console.error("Settings fetch error:", error);
      setError(error.message || "Unable to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setSettings((current) => ({
      ...current,
      [name]: newValue,
    }));

    updateSetting(name, newValue);
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(settings),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (response.status === 403) {
          setPermissionPopup(true);
          return;
        }

        throw new Error(
          result.message || "Unable to save settings."
        );
      }

      setSettings({
        companyName: result.data.companyName,
        defaultLocation: result.data.defaultLocation,
        planningHorizon: result.data.planningHorizon,
        serviceLevel: result.data.serviceLevel,
        notifications: result.data.notifications,
        emailAlerts: result.data.emailAlerts,
        aiRecommendations: result.data.aiRecommendations,
      });

      setSaved(true);
    } catch (error) {
      console.error("Settings save error:", error);
      setError(error.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.settings}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Settings</h1>
            <p>Loading settings...</p>
          </div>
        </div>

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

              <h3 id="permission-title">Access Denied</h3>

              <p>
                You do not have permission to access settings.
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
        )}
      </div>
    );
  }

  return (
    <div className={styles.settings}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Settings</h1>
          <p>
            Configure organisation, planning, notification and AI
            preferences.
          </p>
        </div>
      </div>

      {saved && (
        <div className={styles.successMessage}>
          Settings saved successfully.
        </div>
      )}

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Organisation Settings</h2>
          <p>Configure basic organisation information.</p>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Organisation Name</label>

            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Default Location</label>

            <select
              name="defaultLocation"
              value={settings.defaultLocation}
              onChange={handleChange}
            >
              <option>Hyderabad</option>
              <option>Delhi</option>
              <option>Mumbai</option>
              <option>Bengaluru</option>
              <option>Chennai</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Planning Configuration</h2>
          <p>
            Configure inventory and procurement planning parameters.
          </p>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Planning Horizon</label>

            <select
              name="planningHorizon"
              value={settings.planningHorizon}
              onChange={handleChange}
            >
              <option>7 Days</option>
              <option>14 Days</option>
              <option>30 Days</option>
              <option>60 Days</option>
              <option>90 Days</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Target Service Level</label>

            <select
              name="serviceLevel"
              value={settings.serviceLevel}
              onChange={handleChange}
            >
              <option>90%</option>
              <option>95%</option>
              <option>98%</option>
              <option>99%</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Notifications</h2>
          <p>Control system and planning notifications.</p>
        </div>

        <div className={styles.settingList}>
          <label className={styles.settingRow}>
            <div>
              <strong>In-app Notifications</strong>
              <span>
                Receive alerts and system notifications.
              </span>
            </div>

            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
            />
          </label>

          <label className={styles.settingRow}>
            <div>
              <strong>Email Alerts</strong>
              <span>
                Receive important alerts by email.
              </span>
            </div>

            <input
              type="checkbox"
              name="emailAlerts"
              checked={settings.emailAlerts}
              onChange={handleChange}
            />
          </label>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>AI Configuration</h2>
          <p>
            Control how AI recommendations are displayed.
          </p>
        </div>

        <div className={styles.settingList}>
          <label className={styles.settingRow}>
            <div>
              <strong>AI Recommendations</strong>
              <span>
                Allow AI-generated demand, replenishment and
                purchase recommendations.
              </span>
            </div>

            <input
              type="checkbox"
              name="aiRecommendations"
              checked={settings.aiRecommendations}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className={styles.aiNotice}>
          <strong>Decision Support Only</strong>
          <span>
            AI recommendations do not automatically execute
            purchases or inventory actions. Authorised users must
            review and approve decisions.
          </span>
        </div>
      </section>

      <div className={styles.saveSection}>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

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

            <h3 id="permission-title">Access Denied</h3>

            <p>
              You do not have permission to access settings.
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
      )}
    </div>
  );
}

export default Settings;