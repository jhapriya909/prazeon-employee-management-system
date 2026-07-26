import { useEffect, useMemo, useState } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";

import { getAllAttendance } from "../../services/adminAttendanceService";
import "../../styles/adminAttendance.css";

function AdminAttendance() {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    present: 0,
    halfDay: 0,
    absent: 0,
    leave: 0,
    currentlyWorking: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllAttendance(selectedDate);

      setAttendance(data.attendance || []);
      setSummary(
        data.summary || {
          totalEmployees: 0,
          present: 0,
          halfDay: 0,
          absent: 0,
          leave: 0,
          currentlyWorking: 0,
        }
      );
    } catch (error) {
      console.error("Admin attendance loading error:", error);

      if (error.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else if (error.response?.status === 403) {
        setError("Only administrators can access attendance records.");
      } else {
        setError("Unable to load attendance data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return attendance;

    return attendance.filter((record) => {
      const employee = record.employee || {};

      return (
        employee.name?.toLowerCase().includes(value) ||
        employee.email?.toLowerCase().includes(value) ||
        employee.employeeId?.toLowerCase().includes(value) ||
        employee.department?.toLowerCase().includes(value)
      );
    });
  }, [attendance, search]);

  const formatTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes = 0) => {
    if (!minutes) return "--";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "admin-attendance-status present";
      case "Half Day":
        return "admin-attendance-status half-day";
      case "Leave":
        return "admin-attendance-status leave";
      default:
        return "admin-attendance-status absent";
    }
  };

  return (
    <div className="admin-attendance-page">
      <div className="admin-attendance-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Track daily employee attendance and working hours.</p>
        </div>

        <button
          type="button"
          className="admin-attendance-refresh"
          onClick={loadAttendance}
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {error && <div className="admin-attendance-error">{error}</div>}

      <div className="admin-attendance-stats">
        <div className="admin-attendance-stat-card">
          <div className="admin-attendance-stat-icon total">
            <FiUsers />
          </div>
          <div>
            <span>Total Employees</span>
            <strong>{summary.totalEmployees}</strong>
          </div>
        </div>

        <div className="admin-attendance-stat-card">
          <div className="admin-attendance-stat-icon present">
            <FiUserCheck />
          </div>
          <div>
            <span>Present</span>
            <strong>{summary.present}</strong>
          </div>
        </div>

        <div className="admin-attendance-stat-card">
          <div className="admin-attendance-stat-icon working">
            <FiClock />
          </div>
          <div>
            <span>Working Now</span>
            <strong>{summary.currentlyWorking}</strong>
          </div>
        </div>

        <div className="admin-attendance-stat-card">
          <div className="admin-attendance-stat-icon absent">
            <FiUserX />
          </div>
          <div>
            <span>Absent</span>
            <strong>{summary.absent}</strong>
          </div>
        </div>
      </div>

      <div className="admin-attendance-panel">
        <div className="admin-attendance-toolbar">
          <div>
            <h2>Daily Attendance</h2>
            <p>{filteredAttendance.length} employee records</p>
          </div>

          <div className="admin-attendance-filters">
            <div className="admin-attendance-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <input
              className="admin-attendance-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-attendance-state">
            Loading attendance...
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="admin-attendance-state">
            No attendance records found.
          </div>
        ) : (
          <div className="admin-attendance-table-wrapper">
            <table className="admin-attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record.employee?._id}>
                    <td>
                      <div className="admin-attendance-employee">
                        <div className="admin-attendance-avatar">
                          {record.employee?.name
                            ?.charAt(0)
                            .toUpperCase() || "E"}
                        </div>

                        <div>
                          <strong>
                            {record.employee?.name || "Unknown Employee"}
                          </strong>
                          <span>
                            {record.employee?.employeeId || "-"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>
                        {record.employee?.department || "-"}
                      </strong>
                      <span className="admin-attendance-designation">
                        {record.employee?.designation || "-"}
                      </span>
                    </td>

                    <td>{formatTime(record.checkIn)}</td>
                    <td>{formatTime(record.checkOut)}</td>
                    <td>{formatDuration(record.totalMinutes)}</td>

                    <td>
                      <span className={getStatusClass(record.status)}>
                        {record.status || "Absent"}
                      </span>
                    </td>
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

export default AdminAttendance;
