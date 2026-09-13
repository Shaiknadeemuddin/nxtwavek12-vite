import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import Profile from "../../pages/Profile/Profile";

function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleNotifications = () => {
    navigate("/dashboard/notifications");
  };

  const handleProfile = () => {
    setShowProfile(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const userName = user?.name || "User";
  const userRole = user?.role || "Inventory Planner";

  return (
    <>
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.logo}>K-12 Optimiser</div>
        </div>

        <div className={styles.rightSection}>
          <button
            type="button"
            className={styles.notificationButton}
            aria-label="Notifications"
            onClick={handleNotifications}
          >
            🔔
          </button>

          <button
            type="button"
            className={styles.profile}
            onClick={handleProfile}
            aria-label="Open profile"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatar}>
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className={styles.userInfo}>
              <span className={styles.name}>{userName}</span>
              <span className={styles.role}>{userRole}</span>
            </div>
          </button>
        </div>
      </header>

      {showProfile && (
        <Profile
          onClose={handleCloseProfile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
}

export default Header;