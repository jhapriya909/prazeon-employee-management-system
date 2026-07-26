import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiClock,
  FiCalendar,
  FiCheckSquare,
  FiTrendingUp,
} from "react-icons/fi";

import {
  checkInEmployee,
  getEmployeeLeaves,
  getEmployeeTasks,
  getTodayAttendance,
} from "../../services/dashboardService";

import "../../styles/dashboard.css";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState(null);

  const [leaveData, setLeaveData] = useState({
    summary: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      approvedDays: 0,
    },
    leaves: [],
  });

  const [taskData, setTaskData] = useState({
    summary: {
      total: 0,
      pending: 0,
      inProgress: 0,
      done: 0,
    },
    tasks: [],
  });

  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        attendanceResponse,
        leaveResponse,
        taskResponse,
      ] = await Promise.all([
        getTodayAttendance(),
        getEmployeeLeaves(),
        getEmployeeTasks(),
      ]);

      const todayAttendance =
        attendanceResponse?.attendance ||
        attendanceResponse?.data ||
        attendanceResponse ||
        null;

      setAttendance(todayAttendance);

      setLeaveData({
        summary: leaveResponse?.summary || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          approvedDays: 0,
        },

        leaves: leaveResponse?.leaves || [],
      });

      setTaskData({
        summary: taskResponse?.summary || {
          total: 0,
          pending: 0,
          inProgress: 0,
          done: 0,
        },

        tasks: taskResponse?.tasks || [],
      });
    } catch (requestError) {
      console.error("Dashboard data error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setCheckInLoading(true);
      setError("");

      const response = await checkInEmployee();

      const updatedAttendance =
        response?.attendance ||
        response?.data ||
        response;

      setAttendance(updatedAttendance);
    } catch (requestError) {
      console.error("Check-in error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to check in. Please try again."
      );
    } finally {
      setCheckInLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "--";

    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityClass = (priority) => {
    return priority?.toLowerCase() || "medium";
  };

  const getStatusClass = (status) => {
    if (status === "Done") return "done";
    if (status === "In Progress") return "progress";

    return "pending";
  };

  const isCheckedIn = Boolean(attendance?.checkIn);
  const isCheckedOut = Boolean(attendance?.checkOut);

  const approvedLeaves = leaveData.leaves.filter(
    (leave) => leave.status === "Approved"
  );

  const usedCasualLeaves = approvedLeaves
    .filter((leave) => leave.leaveType === "Casual")
    .reduce(
      (total, leave) =>
        total + Number(leave.totalDays || 0),
      0
    );

  const usedSickLeaves = approvedLeaves
    .filter((leave) => leave.leaveType === "Sick")
    .reduce(
      (total, leave) =>
        total + Number(leave.totalDays || 0),
      0
    );

  const usedEarnedLeaves = approvedLeaves
    .filter((leave) => leave.leaveType === "Earned")
    .reduce(
      (total, leave) =>
        total + Number(leave.totalDays || 0),
      0
    );

  const casualLeaveBalance = Math.max(
    12 - usedCasualLeaves,
    0
  );

  const sickLeaveBalance = Math.max(
    10 - usedSickLeaves,
    0
  );

  const earnedLeaveBalance = Math.max(
    15 - usedEarnedLeaves,
    0
  );

  const totalLeaveBalance =
    casualLeaveBalance +
    sickLeaveBalance +
    earnedLeaveBalance;

  const activeTaskCount =
    Number(taskData.summary.pending || 0) +
    Number(taskData.summary.inProgress || 0);

  const attendanceHeading = isCheckedOut
    ? "Checked Out"
    : isCheckedIn
      ? "Checked In"
      : "Not Checked In";

  const attendanceDescription = isCheckedOut
    ? `Checked out at ${formatTime(attendance.checkOut)}`
    : isCheckedIn
      ? `Checked in at ${formatTime(attendance.checkIn)}`
      : "Mark your attendance to begin work.";

  return (
    <section className="dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <h2>Dashboard</h2>

          <p>
            Monitor your attendance, leave balance and
            assigned tasks.
          </p>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <div className="dashboard-stats-grid">
        <article className="dashboard-stat-card">
          <div className="stat-icon">
            <FiClock />
          </div>

          <div>
            <span>Today&apos;s Attendance</span>

            <h3>
              {loading
                ? "Loading..."
                : attendanceHeading}
            </h3>

            <p>
              {loading
                ? "Please wait..."
                : attendanceDescription}
            </p>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon">
            <FiCalendar />
          </div>

          <div>
            <span>Leave Balance</span>

            <h3>
              {loading
                ? "--"
                : `${totalLeaveBalance} Days`}
            </h3>

            <p>
              Casual, sick and earned leave remaining.
            </p>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon">
            <FiCheckSquare />
          </div>

          <div>
            <span>Pending Tasks</span>

            <h3>
              {loading
                ? "--"
                : `${activeTaskCount} ${
                    activeTaskCount === 1
                      ? "Task"
                      : "Tasks"
                  }`}
            </h3>

            <p>Tasks waiting for your action.</p>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>

          <div>
            <span>Pending Leaves</span>

            <h3>
              {loading
                ? "--"
                : leaveData.summary.pending}
            </h3>

            <p>
              Your leave requests awaiting approval.
            </p>
          </div>
        </article>
      </div>

      <div className="dashboard-content-grid">
        <article className="dashboard-panel attendance-panel">
          <div className="panel-heading">
            <div>
              <h3>Today&apos;s Attendance</h3>

              <p>
                Check in when you begin and check out
                after work.
              </p>
            </div>

            <span
              className={`status-badge ${
                isCheckedOut
                  ? "done"
                  : isCheckedIn
                    ? "progress"
                    : "pending"
              }`}
            >
              {isCheckedOut
                ? "Completed"
                : isCheckedIn
                  ? "Working"
                  : "Pending"}
            </span>
          </div>

          <div className="attendance-time-box">
            <span>Current status</span>

            <strong>
              {loading
                ? "Loading attendance..."
                : attendanceHeading}
            </strong>

            <p>
              {isCheckedOut
                ? `Check-out time: ${formatTime(
                    attendance.checkOut
                  )}`
                : isCheckedIn
                  ? `Check-in time: ${formatTime(
                      attendance.checkIn
                    )}`
                  : "Your working time will appear here after check-in."}
            </p>
          </div>

          {!isCheckedIn && !loading && (
            <button
              type="button"
              className="primary-dashboard-button"
              onClick={handleCheckIn}
              disabled={checkInLoading}
            >
              {checkInLoading
                ? "Checking In..."
                : "Check In"}
            </button>
          )}

          {isCheckedIn && !isCheckedOut && (
            <button
              type="button"
              className="primary-dashboard-button"
              onClick={() =>
                navigate("/employee/attendance")
              }
            >
              View Attendance
            </button>
          )}

          {isCheckedOut && (
            <button
              type="button"
              className="primary-dashboard-button"
              onClick={() =>
                navigate("/employee/attendance")
              }
            >
              Attendance Completed
            </button>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Leave Overview</h3>
              <p>Your available leave balance.</p>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() =>
                navigate("/employee/leave")
              }
            >
              View all
            </button>
          </div>

          <div className="leave-balance-list">
            <div className="leave-balance-item">
              <div>
                <span>Casual Leave</span>
                <p>Available balance</p>
              </div>

              <strong>
                {loading
                  ? "--"
                  : casualLeaveBalance}
              </strong>
            </div>

            <div className="leave-balance-item">
              <div>
                <span>Sick Leave</span>
                <p>Available balance</p>
              </div>

              <strong>
                {loading
                  ? "--"
                  : sickLeaveBalance}
              </strong>
            </div>

            <div className="leave-balance-item">
              <div>
                <span>Earned Leave</span>
                <p>Available balance</p>
              </div>

              <strong>
                {loading
                  ? "--"
                  : earnedLeaveBalance}
              </strong>
            </div>
          </div>
        </article>
      </div>

      <article className="dashboard-panel recent-tasks-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Tasks</h3>

            <p>
              Your latest assigned work and current
              progress.
            </p>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={() =>
              navigate("/employee/tasks")
            }
          >
            View all tasks
          </button>
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">
                    Loading recent tasks...
                  </td>
                </tr>
              ) : taskData.tasks.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    No tasks assigned.
                  </td>
                </tr>
              ) : (
                taskData.tasks
                  .slice(0, 3)
                  .map((task) => (
                    <tr key={task._id}>
                      <td>
                        <strong>
                          {task.title}
                        </strong>

                        <span>
                          {task.projectName ||
                            "Employee Portal"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`priority-badge ${getPriorityClass(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>

                      <td>
                        {formatDate(task.dueDate)}
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

export default EmployeeDashboard;
