import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

import {
  applyLeave,
  getMyLeaves,
} from "../../services/leaveService";

import "../../styles/leave.css";

function EmployeeLeave() {
  const initialForm = {
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    approvedDays: 0,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyLeaves();

      setLeaves(response.leaves || []);
      setSummary(
        response.summary || {
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          approvedDays: 0,
        }
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load leave requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const response = await applyLeave(formData);

      setMessage(response.message);
      setFormData(initialForm);

      await fetchLeaves();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to submit leave request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateValue) => {
    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <p>Loading leave data...</p>;
  }

  return (
    <section className="leave-page">
      <div className="leave-heading">
        <div>
          <h2>Leave Management</h2>
          <p>Apply for leave and track all your leave requests.</p>
        </div>
      </div>

      {message && <p className="leave-success-message">{message}</p>}
      {error && <p className="leave-error-message">{error}</p>}

      <div className="leave-summary-grid">
        <article className="leave-summary-card">
          <div className="leave-summary-icon pending">
            <FiClock />
          </div>

          <div>
            <span>Pending Requests</span>
            <h3>{summary.pendingRequests}</h3>
          </div>
        </article>

        <article className="leave-summary-card">
          <div className="leave-summary-icon approved">
            <FiCheckCircle />
          </div>

          <div>
            <span>Approved Requests</span>
            <h3>{summary.approvedRequests}</h3>
          </div>
        </article>

        <article className="leave-summary-card">
          <div className="leave-summary-icon rejected">
            <FiXCircle />
          </div>

          <div>
            <span>Rejected Requests</span>
            <h3>{summary.rejectedRequests}</h3>
          </div>
        </article>

        <article className="leave-summary-card">
          <div className="leave-summary-icon days">
            <FiCalendar />
          </div>

          <div>
            <span>Approved Days</span>
            <h3>{summary.approvedDays}</h3>
          </div>
        </article>
      </div>

      <div className="leave-content-grid">
        <article className="leave-form-card">
          <div className="leave-card-heading">
            <h3>Apply for Leave</h3>
            <p>Fill in the details below to submit your request.</p>
          </div>

          <form className="leave-form" onSubmit={handleSubmit}>
            <div className="leave-form-group">
              <label htmlFor="leaveType">Leave Type</label>

              <select
                id="leaveType"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
              >
                <option value="Casual">Casual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Earned">Earned Leave</option>
              </select>
            </div>

            <div className="leave-date-grid">
              <div className="leave-form-group">
                <label htmlFor="startDate">Start Date</label>

                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="leave-form-group">
                <label htmlFor="endDate">End Date</label>

                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || undefined}
                  required
                />
              </div>
            </div>

            <div className="leave-form-group">
              <label htmlFor="reason">Reason</label>

              <textarea
                id="reason"
                name="reason"
                rows="5"
                placeholder="Enter your leave reason"
                value={formData.reason}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="leave-submit-button"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Apply Leave"}
            </button>
          </form>
        </article>

        <article className="leave-history-card">
          <div className="leave-card-heading leave-history-heading">
            <div>
              <h3>My Leave Requests</h3>
              <p>Your submitted leave requests and current status.</p>
            </div>

            <span>{leaves.length} Requests</span>
          </div>

          <div className="leave-table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="leave-empty-message">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <strong>{leave.leaveType}</strong>
                        <span>{leave.reason}</span>
                      </td>

                      <td>
                        {formatDate(leave.startDate)}
                        <br />
                        to {formatDate(leave.endDate)}
                      </td>

                      <td>{leave.totalDays}</td>

                      <td>
                        <span
                          className={`leave-status ${leave.status.toLowerCase()}`}
                        >
                          {leave.status}
                        </span>

                        {leave.status === "Rejected" &&
                          leave.rejectionReason && (
                            <small>{leave.rejectionReason}</small>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}

export default EmployeeLeave;