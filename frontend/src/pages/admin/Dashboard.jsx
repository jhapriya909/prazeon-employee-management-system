import { useEffect, useState } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiCheckSquare,
} from "react-icons/fi";

import { getAdminDashboardData } from "../../services/dashboardService";
import "../../styles/adminDashboard.css";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    totalTasks: 0,
    recentEmployees: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminDashboardData();

      setDashboardData({
        totalEmployees: data.totalEmployees || 0,
        activeEmployees: data.activeEmployees || 0,
        pendingLeaves: data.pendingLeaves || 0,
        totalTasks: data.totalTasks || 0,
        recentEmployees: data.recentEmployees || [],
      });
    } catch (error) {
      console.error("Admin dashboard loading error:", error);

      if (error.response?.status === 401) {
        setError("Your login session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        setError("Only administrators can access this dashboard.");
      } else {
        setError("Unable to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-message">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-heading">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of employees, leaves and assigned tasks.</p>
        </div>

        <button onClick={loadDashboardData}>Refresh</button>
      </div>

      {error && <div className="admin-dashboard-error">{error}</div>}

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FiUsers />
          </div>

          <div>
            <p>Total Employees</p>
            <h2>{dashboardData.totalEmployees}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FiUserCheck />
          </div>

          <div>
            <p>Active Employees</p>
            <h2>{dashboardData.activeEmployees}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FiCalendar />
          </div>

          <div>
            <p>Pending Leaves</p>
            <h2>{dashboardData.pendingLeaves}</h2>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FiCheckSquare />
          </div>

          <div>
            <p>Total Tasks</p>
            <h2>{dashboardData.totalTasks}</h2>
          </div>
        </div>
      </div>

      <div className="recent-employees-section">
        <div className="recent-employees-heading">
          <h2>Recent Employees</h2>
          <span>
            {dashboardData.recentEmployees.length} employees
          </span>
        </div>

        {dashboardData.recentEmployees.length === 0 ? (
          <div className="admin-empty-state">
            No employees found.
          </div>
        ) : (
          <div className="recent-employees-table-wrapper">
            <table className="recent-employees-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                </tr>
              </thead>

              <tbody>
                {dashboardData.recentEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.employeeId || "-"}</td>
                    <td>{employee.name || "-"}</td>
                    <td>{employee.email || "-"}</td>
                    <td>{employee.department || "-"}</td>
                    <td>{employee.designation || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;