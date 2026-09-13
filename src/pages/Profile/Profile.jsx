import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

function Profile({ onClose, onProfileUpdate }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      setError("User information not found. Please log in again.");
      setLoading(false);
      return;
    }

    const loggedInUser = JSON.parse(storedUser);

    setUser(loggedInUser);
    setName(loggedInUser.name || "");
    setEmail(loggedInUser.email || "");
    setProfileImage(loggedInUser.profileImage || "");

    const userId = loggedInUser.id || loggedInUser._id;

    const loadProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${userId}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setName(data.data.name || "");
        setEmail(data.data.email || "");
        setProfileImage(data.data.profileImage || "");

        setUser({
          ...loggedInUser,
          ...data.data,
          id: loggedInUser.id || data.data._id,
        });
      } catch (error) {
        console.error("Profile error:", error);
        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
      event.target.value = "";
    };

    reader.onerror = () => {
      setError("Unable to read the selected image.");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    const userId = user?.id || user?._id;
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setError("Session information not found. Please log in again.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${userId}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            profileImage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to update profile.");
        return;
      }

      const updatedUser = {
        ...user,
        id: user.id || data.data._id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role || user.role,
        profileImage: data.data.profileImage || "",
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setProfileImage(updatedUser.profileImage);

      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Update profile error:", error);
      setError("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setShowLogoutConfirm(false);
    setUser(null);

    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.modal}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <div>
              <h2>My Profile</h2>
              <p>Manage your personal account details.</p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close profile"
            >
              ×
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.imageSection}>
              <div className={styles.imageWrapper}>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                ) : (
                  <div className={styles.avatar}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <label className={styles.uploadButton}>
                Upload Image

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>

              <span className={styles.optional}>
                Optional • Max 2 MB
              </span>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              {error && (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              )}

              {message && (
                <div className={styles.success} role="status">
                  {message}
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="profile-name">Name</label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="profile-email">Email</label>

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="profile-role">Role</label>

                <input
                  id="profile-role"
                  type="text"
                  value={user?.role || ""}
                  disabled
                />
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.logoutButton}
                  onClick={handleLogoutClick}
                  disabled={saving}
                >
                  Logout
                </button>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div
          className={styles.confirmOverlay}
          onClick={handleCancelLogout}
        >
          <div
            className={styles.confirmModal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.confirmIcon}>↪</div>

            <h3>Logout</h3>

            <p>
              Are you sure you want to logout from your account?
            </p>

            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancelButton}
                onClick={handleCancelLogout}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmLogoutButton}
                onClick={handleConfirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;