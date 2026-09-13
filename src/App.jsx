import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login";
import AppLayout from "./components/layout/Applayout";
import Inventory from "./pages/Inventory/Inventory";
import Replenishment from "./pages/Replenishment/Replenishment";
import Forecasting from "./pages/Forecasting/Forecasting";
import PurchasePlanning from "./pages/PurchasePlanning/PurchasePlanning";
import Reports from "./pages/Reports/Reports";
import Notifications from "./pages/Notifications/Notifications";
import Users from "./pages/Users/Users";
import AuditLogs from "./pages/AuditLogs/AuditLogs";
import Settings from "./pages/Settings/Settings";
import InventoryDetail from "./pages/Inventory/InventoryDetail";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "inventory/:id",
        element: <InventoryDetail />,
      },
      {
        path: "replenishment",
        element: <Replenishment />,
      },
      {
        path: "forecasting",
        element: <Forecasting />,
      },
      {
        path: "purchase-planning",
        element: <PurchasePlanning />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "audit-logs",
        element: <AuditLogs />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;