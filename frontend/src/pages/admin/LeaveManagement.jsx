import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiXCircle,
} from "react-icons/fi";

import {
  approveLeaveRequest,
  getAllLeaves,
  rejectLeaveRequest,
} from "../../services/leaveService";

import "../../styles/adminLeave.css";

function AdminLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [rejectingLeave, setRejectingLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllLeaves();
      setLeaves(response.leaves || []);
    } catch (requestError) {
      console.error("Leave loading error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const summary = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter((leave) => leave.status === "Pending")
        .length,
      approved: leaves.filter((leave) => leave.status === "Approved")
        .length,
      rejected: leaves.filter((leave) => leave.status === "Rejected")
        .length,
    };
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return leaves.filter((leave) => {
      const matchesSearch =
        !searchValue ||
        leave.employee?.name?.toLowerCase().includes(searchValue) ||
        leave.employee?.email?.toLowerCase().includes(searchValue) ||
        leave.leaveType?.toLowerCase().includes(searchValue) ||
        leave.reason?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || leave.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaves, search, statusFilter]);

  const handleApprove = async (leaveId) => {
    try {
      setActionLoading(leaveId);
      setError("");
      setMessage("");

      const response = await approveLeaveRequest(leaveId);

      setMessage(
        response.message || "Leave request approved successfully."
      );

      await fetchLeaves();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to approve leave request."
      );
    } finally {
      setActionLoading("");
    }
  };

  const openRejectModal = (leave) => {
    setRejectingLeave(leave);
    setRejectionReason("");
    setError("");
    setMessage("");
  };

  const closeRejectModal = () => {
    setRejectingLeave(null);
    setRejectionReason("");
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setActionLoading(rejectingLeave._id);
      setError("");
      setMessage("");

      const response = await rejectLeaveRequest(
        rejectingLeave._id,
        rejectionReason.trim()
      );

      setMessage(
        response.message || "Leave request rejected successfully."
      );

      closeRejectModal();
      await fetchLeaves();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reject leave request."
      );
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    return `admin-leave-status ${String(status).toLowerCase()}`;
  };

  return (
    <section className="admin-leave-page">
      <div className="admin-leave-heading">
        <div>
          <h1>Leave Management</h1>
          <p>Review, approve and manage employee leave requests.</p>
        </div>

        <button
          type="button"
          className="admin-leave-refresh"
          onClick={fetchLeaves}
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="admin-leave-success">{message}</div>
      )}

      {error && <div className="admin-leave-error">{error}</div>}

      <div className="admin-leave-stats">
        <div className="admin-leave-stat-card">
          <div className="admin-leave-stat-icon total">
            <FiCalendar />
          </div>

          <div>
            <span>Total Requests</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="admin-leave-stat-card">
          <div className="admin-leave-stat-icon pending">
            <FiClock />
          </div>

          <div>
            <span>Pending</span>
            <strong>{summary.pending}</strong>
          </div>
        </div>

        <div className="admin-leave-stat-card">
          <div className="admin-leave-stat-icon approved">
            <FiCheckCircle />
          </div>

          <div>
            <span>Approved</span>
            <strong>{summary.approved}</strong>
          </div>
        </div>

        <div className="admin-leave-stat-card">
          <div className="admin-leave-stat-icon rejected">
            <FiXCircle />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{summary.rejected}</strong>
          </div>
        </div>
      </div>

      <article className="admin-leave-card">
        <div className="admin-leave-toolbar">
          <div>
            <h2>Leave Requests</h2>
            <p>{filteredLeaves.length} request records</p>
          </div>

          <div className="admin-leave-filters">
            <div className="admin-leave-search">
              <FiSearch />

              <input
                type="text"
                placeholder="Search employee or leave..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-leave-state">
            Loading leave requests...
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="admin-leave-state">
            No leave requests found.
          </div>
        ) : (
          <div className="admin-leave-table-wrapper">
            <table className="admin-leave-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="admin-leave-employee">
                        <div className="admin-leave-avatar">
                          {leave.employee?.name
                            ?.charAt(0)
                            .toUpperCase() || "E"}
                        </div>

                        <div>
                          <strong>
                            {leave.employee?.name || "Employee"}
                          </strong>

                          <span>{leave.employee?.email || "-"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-leave-type">
                        {leave.leaveType || "-"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-leave-dates">
                        <strong>{formatDate(leave.startDate)}</strong>
                        <span>to {formatDate(leave.endDate)}</span>
                      </div>
                    </td>

                    <td>
                      <span className="admin-leave-days">
                        {leave.totalDays}
                      </span>
                    </td>

                    <td>
                      <span className="admin-leave-reason">
                        {leave.reason || "-"}
                      </span>
                    </td>

                    <td>
                      <span className={getStatusClass(leave.status)}>
                        {leave.status}
                      </span>
                    </td>

                    <td>
                      {leave.status === "Pending" ? (
                        <div className="admin-leave-actions">
                          <button
                            type="button"
                            className="approve-button"
                            disabled={actionLoading === leave._id}
                            onClick={() => handleApprove(leave._id)}
                          >
                            {actionLoading === leave._id
                              ? "Please wait..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            className="reject-button"
                            disabled={actionLoading === leave._id}
                            onClick={() => openRejectModal(leave)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="completed-action">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {rejectingLeave && (
        <div className="reject-modal-overlay">
          <div className="reject-modal">
            <div className="reject-modal-heading">
              <div>
                <h3>Reject Leave Request</h3>
                <p>
                  Enter a rejection reason for{" "}
                  <strong>{rejectingLeave.employee?.name}</strong>.
                </p>
              </div>

              <button type="button" onClick={closeRejectModal}>
                Ã—
              </button>
            </div>

            <textarea
              rows="5"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(event) =>
                setRejectionReason(event.target.value)
              }
            />

            <div className="reject-modal-actions">
              <button
                type="button"
                className="cancel-reject-button"
                onClick={closeRejectModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-reject-button"
                onClick={handleReject}
                disabled={actionLoading === rejectingLeave._id}
              >
                {actionLoading === rejectingLeave._id
                  ? "Rejecting..."
                  : "Reject Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminLeaveManagement;
