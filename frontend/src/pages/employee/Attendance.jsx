import { useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiLogIn,
  FiLogOut,
} from "react-icons/fi";

import {
  checkInAttendance,
  checkOutAttendance,
  getAttendanceHistory,
  getTodayAttendance,
} from "../../services/attendanceService";

import "../../styles/attendance.css";

function EmployeeAttendance() {
  const now = new Date();

  const [currentTime, setCurrentTime] = useState(now);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError("");

      const [todayResponse, historyResponse] = await Promise.all([
        getTodayAttendance(),
        getAttendanceHistory(selectedMonth, selectedYear),
      ]);

      setTodayAttendance(todayResponse.attendance);
      setAttendanceHistory(historyResponse.attendance || []);
      setSummary(historyResponse.summary || null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load attendance data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth, selectedYear]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await checkInAttendance();

      setTodayAttendance(response.attendance);
      setMessage(response.message);

      await fetchAttendanceData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to check in"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await checkOutAttendance();

      setTodayAttendance(response.attendance);
      setMessage(response.message);

      await fetchAttendanceData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to check out"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "--:--";
    }

    return new Date(dateValue).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateValue) => {
    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatMinutes = (totalMinutes = 0) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [currentTime]
  );

  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [currentTime]
  );

  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);

  const currentStatus = !hasCheckedIn
    ? "Not Checked In"
    : hasCheckedOut
    ? "Checked Out"
    : "Checked In";

  const handleMonthChange = (event) => {
    const [year, month] = event.target.value.split("-");

    setSelectedYear(Number(year));
    setSelectedMonth(Number(month));
  };

  if (loading) {
    return <p>Loading attendance...</p>;
  }

  return (
    <section className="attendance-page">
      <div className="attendance-heading">
        <div>
          <h2>Attendance</h2>
          <p>Manage your daily check-in, check-out and attendance history.</p>
        </div>

        <div className="attendance-month-filter">
          <FiCalendar />

          <input
            type="month"
            value={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}`}
            onChange={handleMonthChange}
          />
        </div>
      </div>

      {message && <p className="attendance-success-message">{message}</p>}
      {error && <p className="attendance-error-message">{error}</p>}

      <div className="attendance-top-grid">
        <article className="attendance-check-card">
          <div className="attendance-card-header">
            <div>
              <span>Today&apos;s Attendance</span>
              <h3>{formattedDate}</h3>
            </div>

            <FiClock />
          </div>

          <div className="live-clock">{formattedTime}</div>

          <div className="attendance-status-box">
            <span>Current status</span>
            <strong>{currentStatus}</strong>

            <p>
              {!hasCheckedIn
                ? "Start your workday by checking in."
                : hasCheckedOut
                ? "Your attendance for today is complete."
                : "You are currently marked present."}
            </p>
          </div>

          <div className="attendance-action-row">
            <button
              type="button"
              className="check-action-button check-in-button"
              onClick={handleCheckIn}
              disabled={hasCheckedIn || actionLoading}
            >
              <FiLogIn />
              {actionLoading ? "Please wait..." : "Check In"}
            </button>

            <button
              type="button"
              className="check-action-button check-out-button"
              onClick={handleCheckOut}
              disabled={!hasCheckedIn || hasCheckedOut || actionLoading}
            >
              <FiLogOut />
              Check Out
            </button>
          </div>
        </article>

        <article className="attendance-summary-card">
          <div className="summary-card-heading">
            <h3>Today&apos;s Summary</h3>
            <FiCheckCircle />
          </div>

          <div className="summary-list">
            <div className="summary-item">
              <span>Check In</span>
              <strong>{formatTime(todayAttendance?.checkIn)}</strong>
            </div>

            <div className="summary-item">
              <span>Check Out</span>
              <strong>{formatTime(todayAttendance?.checkOut)}</strong>
            </div>

            <div className="summary-item">
              <span>Working Hours</span>
              <strong>
                {formatMinutes(todayAttendance?.totalMinutes || 0)}
              </strong>
            </div>

            <div className="summary-item">
              <span>Status</span>
              <strong className="summary-status">
                {todayAttendance?.status || "Pending"}
              </strong>
            </div>
          </div>
        </article>
      </div>

      <article className="attendance-history-card">
        <div className="attendance-history-header">
          <div>
            <h3>Attendance History</h3>
            <p>Your attendance records for the selected month.</p>
          </div>

          <span>{attendanceHistory.length} Records</span>
        </div>

        {summary && (
          <div className="attendance-month-summary">
            <span>Present: {summary.presentDays}</span>
            <span>Half Day: {summary.halfDays}</span>
            <span>Absent: {summary.absentDays}</span>
            <span>Total: {formatMinutes(summary.totalMinutes)}</span>
          </div>
        )}

        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-attendance-message">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendanceHistory.map((record) => (
                  <tr key={record._id}>
                    <td>{formatDate(record.date)}</td>
                    <td>{formatTime(record.checkIn)}</td>
                    <td>{formatTime(record.checkOut)}</td>
                    <td>{formatMinutes(record.totalMinutes)}</td>

                    <td>
                      <span
                        className={`attendance-record-status ${record.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default EmployeeAttendance;