# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

K-12 Education Demand, Inventory & Procurement Optimiser

An AI-assisted demand forecasting, inventory management, replenishment, and procurement optimisation system designed for K-12 school groups.

1. Project Overview

The K-12 Education Demand, Inventory & Procurement Optimiser helps schools manage educational materials and operational supplies efficiently.

Traditional inventory systems often depend on static reorder rules. This can lead to:

- Stock shortages
- Excess inventory
- Unnecessary purchasing
- Higher storage costs
- Cash-flow pressure
- Poor visibility across school locations

This system provides a centralised operational view of inventory, demand, replenishment, forecasting, purchasing, suppliers, and inventory outcomes.

The system uses MongoDB inventory and planning data as inputs to an AI-assisted forecasting and recommendation layer. The backend processes these inputs and generates explainable recommendations with confidence information, which are then reviewed and controlled by authorised users.

«AI recommendations are decision-support only. Authorised users retain control over important business actions.»

---

2. Main Features

Dashboard

Provides an overall view of:

- Total inventory
- Stock availability
- Low-stock and stockout risks
- Excess inventory
- Demand and supply information
- Inventory categories
- Operational planning information

Supported inventory categories include:

- Books
- Laboratory Materials
- Uniforms
- Stationery
- Devices
- Maintenance Supplies
- Office Supplies
- Art Supplies

---

Inventory Management

The Inventory module provides:

- Inventory search
- School filtering
- Category filtering
- Status filtering
- Sorting
- Pagination
- CSV export
- Inventory KPIs
- Item details
- Stock information
- Allocation analysis

The Allocation View identifies situations where stock can potentially be transferred between locations and highlights locations where purchasing may be required.

---

Replenishment

The Replenishment module helps planners identify inventory that requires action.

It provides:

- Replenishment recommendations
- Stockout risks
- Excess-stock situations
- Recommended quantities
- Inventory planning information
- AI-assisted recommendations

---

Demand Forecasting

The Forecasting module provides:

- Forecast demand
- Current stock comparison
- Demand gaps
- Forecast state
- Category-level forecasting
- Stockout risk
- Excess-stock identification
- Forecast confidence
- AI recommendation details
- Model version
- Source data
- Generated timestamp

Forecast states include:

- Stockout Risk
- Excess Stock
- Demand Above Stock
- Balanced

---

Purchase Planning

The Purchase Planning module helps authorised users review AI-assisted purchasing recommendations.

Users can:

- Review recommendations
- Approve recommendations
- Reject recommendations
- Defer recommendations
- Override recommended quantities
- Provide reasons for rejection
- Provide reasons for deferring
- Provide reasons for overriding

Review actions are recorded for auditability.

---

Supplier Evaluation

The system provides supplier-related planning information and supplier scorecards to support procurement decisions.

Supplier evaluation can consider factors such as:

- Supplier performance
- Lead-time considerations
- Reliability
- Procurement planning requirements

---

Reports & Analytics

The Reports module provides operational reporting for:

- Inventory
- Demand
- Procurement
- Planning outcomes
- Forecast-related information

---

Notifications

The Notifications module provides users with system notifications related to important inventory and planning activities.

Users can:

- View notifications
- Mark notifications as read
- Mark all notifications as read
- Delete notifications

---

User & Role Management

The system supports role-based access control.

Available roles:

1. Procurement Manager
2. Inventory Planner
3. Warehouse User
4. Finance Reviewer
5. Supplier

Different roles receive different levels of access to system modules and actions.

---

Audit Logs

The Audit Logs module records important system activities such as:

- User actions
- Approvals
- Rejections
- Overrides
- System operations
- User-related activities

This provides traceability for important decisions.

---

Settings

The Settings module allows authorised users to manage system configuration such as:

- Company name
- Default location
- Planning horizon
- Service level
- Notifications
- Email alerts
- AI recommendations

---

Profile

Users can manage their profile information, including:

- Name
- Profile image
- Role information

The profile is displayed through the header profile popup.

---

3. AI-Assisted Recommendation System

The system uses an AI-assisted rules and recommendation layer to analyse inventory and planning information.

The recommendation layer can consider:

- Current stock
- Forecast demand
- Safety stock
- Demand gaps
- Inventory risk
- Planning requirements

AI outputs provide:

- Recommended action
- Confidence
- Explanation
- Source data
- Model version
- Generated timestamp

Users can review and control recommendations rather than allowing AI to perform high-impact actions automatically.

---

4. Authentication & Security

The application uses:

- JWT authentication
- Password hashing using bcrypt
- Role-based access control
- Protected backend routes
- Protected frontend routes
- Request validation
- Permission-based access
- Audit logging

Sensitive configuration such as MongoDB credentials and JWT secrets is stored in environment variables and is not committed to GitHub.

---

5. Technology Stack

Frontend

- React.js
- Vite
- React Router
- CSS Modules
- JavaScript (JSX)
- Fetch API

Backend

- Node.js
- Express.js
- JWT
- bcryptjs
- Express Validator

Database

- MongoDB
- MongoDB Atlas
- Mongoose

Development Tools

- VS Code
- Git
- GitHub
- Render

---

6. Project Structure

nxtwaveproject-vite/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auditLogsController.js
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── forecastingController.js
│   │   ├── inventoryController.js
│   │   ├── notificationsController.js
│   │   ├── purchasePlanningController.js
│   │   ├── replenishmentController.js
│   │   ├── reportsController.js
│   │   ├── settingsController.js
│   │   └── usersController.js
│   │
│   ├── middleware/
│   │   ├── auditLogValidation.js
│   │   ├── authMiddleware.js
│   │   ├── authValidation.js
│   │   ├── notificationValidation.js
│   │   ├── purchasePlanningValidation.js
│   │   ├── roleMiddleware.js
│   │   ├── settingsValidation.js
│   │   └── userValidation.js
│   │
│   ├── models/
│   │   ├── AuditLog.js
│   │   ├── Forecast.js
│   │   ├── Inventory.js
│   │   ├── Notification.js
│   │   ├── PurchaseRecommendation.js
│   │   ├── Settings.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── auditLogsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── forecastingRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── notificationsRoutes.js
│   │   ├── purchasePlanningRoutes.js
│   │   ├── replenishmentRoutes.js
│   │   ├── reportsRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── usersRoutes.js
│   │
│   ├── seedInventory.js
│   ├── seedUser.js
│   ├── package.json
│   └── server.js
│
├── public/
│
├── src/
│   ├── components/
│   │   └── layout/
│   │
│   ├── context/
│   │
│   ├── pages/
│   │   ├── AuditLogs/
│   │   ├── Dashboard/
│   │   ├── Forecasting/
│   │   ├── Inventory/
│   │   ├── Notifications/
│   │   ├── Profile/
│   │   ├── PurchasePlanning/
│   │   ├── Replenishment/
│   │   ├── Reports/
│   │   ├── Settings/
│   │   └── Users/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js

Configuration Files

"vite.config.js"

Contains the configuration required by Vite to develop and build the React frontend.

"eslint.config.js"

Contains ESLint configuration used to identify potential JavaScript and React code issues.

---

7. User Roles & Permissions

Role| Main Access
Procurement Manager| Full planning, procurement, reports, users, audit logs and settings access
Inventory Planner| Inventory, replenishment, forecasting and purchase-planning access
Warehouse User| Inventory and replenishment-related access
Finance Reviewer| Inventory, purchase-planning and reports access
Supplier| Restricted access

Access to protected modules is controlled by role-based permissions.

---

8. Demo Login Credentials

The following demo users are created by "backend/seedUser.js".

Inventory Planner

Email: admin@k12optimiser.com
Password: Admin@123

Procurement Manager

Email: rahul.sharma@example.com
Password: User@123

Procurement Manager

Email: ral.sharma@example.com
Password: User@123

Inventory Planner

Email: priya.reddy@example.com
Password: User@123

Warehouse User

Email: arjun.kumar@example.com
Password: User@123

Finance Reviewer

Email: sneha.patel@example.com
Password: User@123

Supplier

Email: vikram.singh@example.com
Password: User@123
Status: Inactive

The inactive Supplier account is intended to demonstrate account-status restrictions.

---

9. How to Run the Project

Prerequisites

Install:

- Node.js
- npm
- MongoDB Atlas account
- Git

---

Step 1: Clone the Repository

git clone <repository-url>
cd nxtwaveproject-vite

---

Step 2: Install Frontend Dependencies

npm install

---

Step 3: Install Backend Dependencies

cd backend
npm install

---

Step 4: Configure Backend Environment Variables

Create:

backend/.env

Add:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Do not commit ".env" to GitHub.

---

Step 5: Configure Frontend Environment Variables

Create:

.env

Add:

VITE_API_URL=http://localhost:5000/api

For deployment, replace the local backend URL with the deployed backend API URL.

---

Step 6: Start the Backend

From the "backend" directory:

npm run dev

The backend runs on:

http://localhost:5000

---

Step 7: Start the Frontend

Open another terminal in the project root:

npm run dev

The Vite development server will provide the frontend URL.

---

10. Database

The application uses MongoDB Atlas for storing application data.

The backend connects to MongoDB using the "MONGO_URI" environment variable.

The project contains seed scripts for creating:

- Demo users
- Inventory data

---

11. API Structure

The backend provides REST APIs for:

/api/auth
/api/dashboard
/api/inventory
/api/replenishment
/api/forecasting
/api/purchase-planning
/api/reports
/api/notifications
/api/users
/api/audit-logs
/api/settings

Protected APIs use JWT authentication and role-based access control where required.

---

12. Human Review of AI Recommendations

The system does not automatically execute high-impact procurement decisions.

Authorised users can:

- Approve
- Reject
- Defer
- Override

When required, users must provide a reason for their decision.

This provides human control, accountability, and traceability over AI-assisted recommendations.

---

13. Project Objective

The primary objective of the project is to provide K-12 schools with a centralised system that can:

1. Understand inventory availability.
2. Forecast future demand.
3. Identify stockout and excess-stock risks.
4. Recommend replenishment actions.
5. Support purchase planning.
6. Evaluate supplier information.
7. Support inventory allocation between locations.
8. Provide explainable AI-assisted recommendations.
9. Maintain role-based access control.
10. Maintain an audit trail for important actions.

---

14. Future Enhancements

Possible future improvements include:

- Advanced machine-learning forecasting models
- Scenario simulation
- ERP integration
- External market-data integration
- Multi-factor authentication
- Advanced supplier risk modelling
- Automated scheduled forecasting
- Advanced observability and monitoring
- More detailed inventory optimisation algorithms

---

15. Project Status

The current implementation includes the major frontend and backend modules required for the K-12 inventory and procurement optimisation workflow.

The application is connected to MongoDB and supports authentication, role-based access control, inventory management, forecasting, replenishment, purchase planning, reporting, notifications, user management, audit logging, and settings.

AI recommendations are currently implemented as an AI-assisted decision-support layer rather than a production machine-learning training pipeline.