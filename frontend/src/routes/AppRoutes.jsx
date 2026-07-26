import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// Auth
import Login from "../pages/auth/Login";

// Layouts
import EmployeeLayout from "../layouts/EmployeeLayout";
import AdminLayout from "../layouts/AdminLayout";
import ClientLayout from "../layouts/ClientLayout";

// Employee Pages
import EmployeeDashboard from "../pages/employee/Dashboard";
import EmployeeAttendance from "../pages/employee/Attendance";
import EmployeeLeave from "../pages/employee/Leave";
import EmployeeTasks from "../pages/employee/Tasks";
import EmployeeProfile from "../pages/employee/Profile";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminAttendance from "../pages/admin/Attendance";
import Employees from "../pages/admin/Employees";
import AdminTasks from "../pages/admin/Tasks";
import AdminLeaveManagement from "../pages/admin/LeaveManagement";
import Settings from "../pages/admin/Settings";

// Client Pages
import ClientDashboard from "../pages/client/Dashboard";
import MyRequests from "../pages/client/MyRequests";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Employee Routes */}
        <Route
          path="/employee"
          element={<EmployeeLayout />}
        >
          <Route
            index
            element={
              <Navigate
                to="/employee/dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<EmployeeDashboard />}
          />

          <Route
            path="attendance"
            element={<EmployeeAttendance />}
          />

          <Route
            path="leave"
            element={<EmployeeLeave />}
          />

          <Route
            path="tasks"
            element={<EmployeeTasks />}
          />

          <Route
            path="profile"
            element={<EmployeeProfile />}
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            index
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="employees"
            element={<Employees />}
          />

          <Route
            path="attendance"
            element={<AdminAttendance />}
          />

          <Route
            path="tasks"
            element={<AdminTasks />}
          />

          <Route
            path="leaves"
            element={<AdminLeaveManagement />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>

        {/* Client Routes */}
        <Route
          path="/client"
          element={<ClientLayout />}
        >
          <Route
            index
            element={
              <Navigate
                to="/client/dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<ClientDashboard />}
          />

          <Route
            path="requests"
            element={<MyRequests />}
          />
        </Route>

        {/* Invalid Route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;