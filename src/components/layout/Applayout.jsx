import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import styles from "./AppLayout.module.css";

function AppLayout() {
  return (
    <div className={styles.app}>
      <Header />

      <div className={styles.mainArea}>
        <Sidebar />

        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;