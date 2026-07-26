import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiMessageSquare,
  FiRefreshCw,
  FiSend,
  FiX,
} from "react-icons/fi";
import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/tasks/client/my`,
        getAuthConfig()
      );

      setRequests(response.data?.requests || []);
    } catch (requestError) {
      console.error("Load client requests error:", requestError);

      if (requestError.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (requestError.response?.status === 403) {
        setError("Please login using a client account.");
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to load requests."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const summary = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter(
        (request) => request.status === "Pending"
      ).length,

      inProgress: requests.filter(
        (request) => request.status === "In Progress"
      ).length,

      completed: requests.filter(
        (request) => request.status === "Done"
      ).length,
    };
  }, [requests]);

  const openCommentModal = (request) => {
    setSelectedRequest(request);
    setCommentMessage("");
    setError("");
    setSuccess("");
    setShowCommentModal(true);
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!commentMessage.trim()) {
      setError("Please enter a comment.");
      return;
    }

    try {
      setCommentLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `${API_URL}/${selectedRequest._id}/comments`,
        {
          message: commentMessage.trim(),
        },
        getAuthConfig()
      );

      const updatedRequest =
        response.data?.task || response.data?.request;

      if (updatedRequest) {
        setRequests((currentRequests) =>
          currentRequests.map((request) =>
            request._id === updatedRequest._id
              ? updatedRequest
              : request
          )
        );

        setSelectedRequest(updatedRequest);
      } else {
        await loadRequests();
      }

      setCommentMessage("");
      setSuccess("Comment added successfully.");
    } catch (requestError) {
      console.error("Add client comment error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not assigned";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    if (status === "Done") {
      return {
        color: "#23844d",
        backgroundColor: "#e8f7ee",
      };
    }

    if (status === "In Progress") {
      return {
        color: "#286cc6",
        backgroundColor: "#e8f1ff",
      };
    }

    return {
      color: "#a46c00",
      backgroundColor: "#fff4d8",
    };
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High" || priority === "Urgent") {
      return {
        color: "#d64545",
        backgroundColor: "#fdecec",
      };
    }

    if (priority === "Low") {
      return {
        color: "#318457",
        backgroundColor: "#e9f7ef",
      };
    }

    return {
      color: "#7859cf",
      backgroundColor: "#f0ebff",
    };
  };

  const cardStyle = {
    padding: "22px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #eceef5",
    boxShadow: "0 6px 18px rgba(20,28,70,0.04)",
  };

  return (
    <div
      style={{
        padding: "28px",
        color: "#171d35",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "22px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "27px",
            }}
          >
            My Requests
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "#8990a5",
              fontSize: "13px",
            }}
          >
            View and track all your submitted project requests.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          style={{
            width: "42px",
            height: "42px",
            display: "grid",
            placeItems: "center",
            color: "#5f4adf",
            backgroundColor: "#ffffff",
            border: "1px solid #dedff0",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          title="Refresh requests"
        >
          <FiRefreshCw />
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 14px",
            marginBottom: "16px",
            color: "#b93c3c",
            backgroundColor: "#fff0f0",
            border: "1px solid #ffd4d4",
            borderRadius: "9px",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "12px 14px",
            marginBottom: "16px",
            color: "#247a43",
            backgroundColor: "#ecf9f0",
            border: "1px solid #cdebd6",
            borderRadius: "9px",
            fontSize: "13px",
          }}
        >
          {success}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <div style={cardStyle}>
          <FiAlertCircle size={22} color="#6652e7" />

          <p
            style={{
              margin: "14px 0 5px",
              color: "#8990a5",
              fontSize: "12px",
            }}
          >
            Total Requests
          </p>

          <strong style={{ fontSize: "24px" }}>
            {summary.total}
          </strong>
        </div>

        <div style={cardStyle}>
          <FiClock size={22} color="#d29113" />

          <p
            style={{
              margin: "14px 0 5px",
              color: "#8990a5",
              fontSize: "12px",
            }}
          >
            Pending
          </p>

          <strong style={{ fontSize: "24px" }}>
            {summary.pending}
          </strong>
        </div>

        <div style={cardStyle}>
          <FiRefreshCw size={22} color="#367dd0" />

          <p
            style={{
              margin: "14px 0 5px",
              color: "#8990a5",
              fontSize: "12px",
            }}
          >
            In Progress
          </p>

          <strong style={{ fontSize: "24px" }}>
            {summary.inProgress}
          </strong>
        </div>

        <div style={cardStyle}>
          <FiCheckCircle size={22} color="#2e9a61" />

          <p
            style={{
              margin: "14px 0 5px",
              color: "#8990a5",
              fontSize: "12px",
            }}
          >
            Completed
          </p>

          <strong style={{ fontSize: "24px" }}>
            {summary.completed}
          </strong>
        </div>
      </div>

      <section style={cardStyle}>
        <div style={{ marginBottom: "18px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
            }}
          >
            Request History
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#9096a8",
              fontSize: "12px",
            }}
          >
            {requests.length} request records
          </p>
        </div>

        {loading ? (
          <div
            style={{
              padding: "55px 10px",
              textAlign: "center",
              color: "#9096a8",
            }}
          >
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div
            style={{
              padding: "55px 10px",
              textAlign: "center",
              color: "#9096a8",
            }}
          >
            No requests found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "850px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f7f8fc",
                    color: "#777f96",
                    fontSize: "11px",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "14px" }}>
                    Request
                  </th>
                  <th style={{ padding: "14px" }}>
                    Priority
                  </th>
                  <th style={{ padding: "14px" }}>
                    Assigned Employee
                  </th>
                  <th style={{ padding: "14px" }}>
                    Due Date
                  </th>
                  <th style={{ padding: "14px" }}>
                    Status
                  </th>
                  <th style={{ padding: "14px" }}>
                    Comments
                  </th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request._id}
                    style={{
                      borderBottom: "1px solid #edf0f5",
                    }}
                  >
                    <td style={{ padding: "15px" }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "13px",
                        }}
                      >
                        {request.title}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "5px",
                          color: "#9298aa",
                          fontSize: "11px",
                        }}
                      >
                        {request.projectName ||
                          "Employee Portal"}
                      </span>
                    </td>

                    <td style={{ padding: "15px" }}>
                      <span
                        style={{
                          ...getPriorityStyle(
                            request.priority
                          ),
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        {request.priority || "Medium"}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        fontSize: "12px",
                      }}
                    >
                      {request.assignedTo?.name ||
                        "Not assigned yet"}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        fontSize: "12px",
                      }}
                    >
                      {formatDate(request.dueDate)}
                    </td>

                    <td style={{ padding: "15px" }}>
                      <span
                        style={{
                          ...getStatusStyle(request.status),
                          display: "inline-block",
                          padding: "6px 13px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        {request.status || "Pending"}
                      </span>
                    </td>

                    <td style={{ padding: "15px" }}>
                      <button
                        type="button"
                        onClick={() =>
                          openCommentModal(request)
                        }
                        style={{
                          width: "36px",
                          height: "34px",
                          display: "grid",
                          placeItems: "center",
                          color: "#5f4adf",
                          backgroundColor: "#f0edff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <FiMessageSquare />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCommentModal && selectedRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "20px",
            backgroundColor: "rgba(15,20,52,0.55)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "570px",
              padding: "24px",
              boxSizing: "border-box",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  Request Comments
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#8c93a8",
                    fontSize: "12px",
                  }}
                >
                  {selectedRequest.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCommentModal(false)
                }
                style={{
                  width: "34px",
                  height: "34px",
                  display: "grid",
                  placeItems: "center",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <FiX />
              </button>
            </div>

            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                marginBottom: "18px",
              }}
            >
              {!selectedRequest.comments ||
              selectedRequest.comments.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#9298aa",
                  }}
                >
                  No comments yet.
                </p>
              ) : (
                selectedRequest.comments.map(
                  (comment, index) => (
                    <div
                      key={comment._id || index}
                      style={{
                        padding: "12px",
                        marginBottom: "10px",
                        border: "1px solid #e7e9f1",
                        borderRadius: "10px",
                      }}
                    >
                      <strong>
                        {comment.createdBy?.name ||
                          "User"}
                      </strong>

                      <p>{comment.message}</p>
                    </div>
                  )
                )
              )}
            </div>

            <form onSubmit={handleAddComment}>
              <textarea
                rows="3"
                value={commentMessage}
                onChange={(event) =>
                  setCommentMessage(event.target.value)
                }
                placeholder="Write your comment..."
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "15px",
                  boxSizing: "border-box",
                  border: "1px solid #dfe2ec",
                  borderRadius: "9px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowCommentModal(false)
                  }
                  style={{
                    padding: "11px 17px",
                    backgroundColor: "#f3f4f8",
                    border: "none",
                    borderRadius: "9px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={commentLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 17px",
                    color: "#ffffff",
                    backgroundColor: "#604ce2",
                    border: "none",
                    borderRadius: "9px",
                    cursor: "pointer",
                  }}
                >
                  <FiSend />

                  {commentLoading
                    ? "Sending..."
                    : "Add Comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRequests;

