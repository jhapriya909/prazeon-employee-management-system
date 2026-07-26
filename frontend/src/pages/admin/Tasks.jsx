import { useEffect, useMemo, useState } from "react";
import {
  FiArchive,
  FiCheckSquare,
  FiClock,
  FiMessageSquare,
  FiPlayCircle,
  FiPlus,
  FiSearch,
  FiSend,
  FiTrash2,
  FiUserCheck,
  FiX,
} from "react-icons/fi";

import {
  addAdminTaskComment,
  archiveAdminTask,
  assignClientRequest,
  createAdminTask,
  getAllAdminTasks,
  getArchivedAdminTasks,
  getClientRequestQueue,
  getEmployeesForTask,
} from "../../services/adminTaskService";

import "../../styles/adminTasks.css";

function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [clientQueue, setClientQueue] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [activeTab, setActiveTab] = useState("tasks");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [commentMessage, setCommentMessage] = useState("");

  const [assignmentData, setAssignmentData] = useState({
    assignedTo: "",
    dueDate: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectName: "Employee Portal",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  });

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        taskData,
        employeeData,
        queueData,
        archivedData,
      ] = await Promise.all([
        getAllAdminTasks(),
        getEmployeesForTask(),
        getClientRequestQueue(),
        getArchivedAdminTasks(),
      ]);

      setTasks(taskData.tasks || []);
      setEmployees(
        (employeeData.users || []).filter(
          (employee) => employee.isActive !== false
        )
      );
      setClientQueue(queueData.requests || []);
      setArchivedTasks(archivedData.tasks || []);
    } catch (requestError) {
      console.error("Admin task page loading error:", requestError);

      if (requestError.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else if (requestError.response?.status === 403) {
        setError("Only administrators can manage tasks.");
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to load task management data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.isArchived),
    [tasks]
  );

  const summary = useMemo(() => {
    return {
      total: activeTasks.length,
      pending: activeTasks.filter(
        (task) => task.status === "Pending"
      ).length,
      inProgress: activeTasks.filter(
        (task) => task.status === "In Progress"
      ).length,
      done: activeTasks.filter(
        (task) => task.status === "Done"
      ).length,
    };
  }, [activeTasks]);

  const filteredTasks = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return activeTasks.filter((task) => {
      const matchesSearch =
        !searchValue ||
        task.title?.toLowerCase().includes(searchValue) ||
        task.description?.toLowerCase().includes(searchValue) ||
        task.projectName?.toLowerCase().includes(searchValue) ||
        task.assignedTo?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        task.createdByClient?.name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeTasks, search, statusFilter]);

  const filteredClientQueue = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return clientQueue.filter((request) => {
      return (
        !searchValue ||
        request.title?.toLowerCase().includes(searchValue) ||
        request.description
          ?.toLowerCase()
          .includes(searchValue) ||
        request.createdByClient?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        request.createdByClient?.email
          ?.toLowerCase()
          .includes(searchValue)
      );
    });
  }, [clientQueue, search]);

  const filteredArchivedTasks = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return archivedTasks.filter((task) => {
      return (
        !searchValue ||
        task.title?.toLowerCase().includes(searchValue) ||
        task.projectName?.toLowerCase().includes(searchValue) ||
        task.assignedTo?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        task.createdByClient?.name
          ?.toLowerCase()
          .includes(searchValue)
      );
    });
  }, [archivedTasks, search]);

  const displayedTasks = useMemo(() => {
    if (activeTab === "queue") {
      return filteredClientQueue;
    }

    if (activeTab === "archived") {
      return filteredArchivedTasks;
    }

    return filteredTasks;
  }, [
    activeTab,
    filteredTasks,
    filteredClientQueue,
    filteredArchivedTasks,
  ]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetTaskForm = () => {
    setFormData({
      title: "",
      description: "",
      projectName: "Employee Portal",
      assignedTo: "",
      priority: "Medium",
      dueDate: "",
    });
  };

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.assignedTo ||
      !formData.dueDate
    ) {
      setError(
        "Title, description, employee and due date are required."
      );
      return;
    }

    try {
      setFormLoading(true);
      clearMessages();

      const data = await createAdminTask({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectName:
          formData.projectName.trim() ||
          "Employee Portal",
      });

      setTasks((previousTasks) => [
        data.task,
        ...previousTasks,
      ]);

      setSuccessMessage(
        "Task created and assigned successfully."
      );

      resetTaskForm();
      setShowTaskForm(false);
      setActiveTab("tasks");
    } catch (requestError) {
      console.error("Create task error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to create task."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const openAssignModal = (request) => {
    setSelectedRequest(request);
    setAssignmentData({
      assignedTo: "",
      dueDate: "",
    });
    clearMessages();
    setShowAssignModal(true);
  };

  const handleAssignRequest = async (event) => {
    event.preventDefault();

    if (
      !assignmentData.assignedTo ||
      !assignmentData.dueDate
    ) {
      setError("Employee and due date are required.");
      return;
    }

    try {
      setActionLoading(true);
      clearMessages();

      const data = await assignClientRequest(
        selectedRequest._id,
        assignmentData
      );

      setClientQueue((previousRequests) =>
        previousRequests.filter(
          (request) =>
            request._id !== selectedRequest._id
        )
      );

      setTasks((previousTasks) => [
        data.request,
        ...previousTasks.filter(
          (task) => task._id !== data.request._id
        ),
      ]);

      setSuccessMessage(
        "Client request assigned successfully."
      );

      setShowAssignModal(false);
      setSelectedRequest(null);
      setActiveTab("tasks");
    } catch (requestError) {
      console.error(
        "Assign client request error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to assign client request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openCommentModal = (task) => {
    setSelectedTask(task);
    setCommentMessage("");
    clearMessages();
    setShowCommentModal(true);
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!commentMessage.trim()) {
      setError("Comment message is required.");
      return;
    }

    try {
      setActionLoading(true);
      clearMessages();

      const data = await addAdminTaskComment(
        selectedTask._id,
        commentMessage.trim()
      );

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === selectedTask._id
            ? data.task
            : task
        )
      );

      setClientQueue((previousRequests) =>
        previousRequests.map((request) =>
          request._id === selectedTask._id
            ? data.task
            : request
        )
      );

      setSelectedTask(data.task);
      setCommentMessage("");
      setSuccessMessage("Comment added successfully.");
    } catch (requestError) {
      console.error("Add comment error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveTask = async (task) => {
    const isConfirmed = window.confirm(
      `Archive "${task.title}"? Its history will be preserved.`
    );

    if (!isConfirmed) return;

    try {
      setActionLoading(true);
      clearMessages();

      await archiveAdminTask(task._id);

      const archivedTask = {
        ...task,
        isArchived: true,
        closedAt: new Date().toISOString(),
      };

      setTasks((previousTasks) =>
        previousTasks.filter(
          (currentTask) => currentTask._id !== task._id
        )
      );

      setClientQueue((previousRequests) =>
        previousRequests.filter(
          (request) => request._id !== task._id
        )
      );

      setArchivedTasks((previousArchived) => [
        archivedTask,
        ...previousArchived,
      ]);

      setSuccessMessage(
        "Task archived successfully. History is preserved."
      );
    } catch (requestError) {
      console.error("Archive task error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to archive task."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "Done") {
      return "admin-task-status done";
    }

    if (status === "In Progress") {
      return "admin-task-status progress";
    }

    return "admin-task-status pending";
  };

  const getPriorityClass = (priority) => {
    return `admin-task-priority ${String(
      priority || "Medium"
    )
      .toLowerCase()
      .replace(" ", "-")}`;
  };

  const getTaskTypeLabel = (task) => {
    return task.taskType === "Client Request"
      ? "Client Request"
      : "Internal Task";
  };

  return (
    <div className="admin-tasks-page">
      <div className="admin-tasks-header">
        <div>
          <h1>Task Management</h1>
          <p>
            Manage internal tasks and client project
            requests.
          </p>
        </div>

        <button
          type="button"
          className="admin-add-task-button"
          onClick={() => {
            setShowTaskForm(true);
            clearMessages();
          }}
        >
          <FiPlus />
          Assign New Task
        </button>
      </div>

      {error && (
        <div className="admin-task-error">{error}</div>
      )}

      {successMessage && (
        <div className="admin-task-success">
          {successMessage}
        </div>
      )}

      <div className="admin-task-stat-grid">
        <div className="admin-task-stat-card">
          <div className="admin-task-stat-icon total">
            <FiCheckSquare />
          </div>

          <div>
            <span>Total Tasks</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="admin-task-stat-card">
          <div className="admin-task-stat-icon pending">
            <FiClock />
          </div>

          <div>
            <span>Pending</span>
            <strong>{summary.pending}</strong>
          </div>
        </div>

        <div className="admin-task-stat-card">
          <div className="admin-task-stat-icon progress">
            <FiPlayCircle />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{summary.inProgress}</strong>
          </div>
        </div>

        <div className="admin-task-stat-card">
          <div className="admin-task-stat-icon done">
            <FiCheckSquare />
          </div>

          <div>
            <span>Completed</span>
            <strong>{summary.done}</strong>
          </div>
        </div>
      </div>

      <div className="admin-task-panel">
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            className={
              activeTab === "tasks"
                ? "admin-add-task-button"
                : "admin-task-cancel-button"
            }
            onClick={() => {
              setActiveTab("tasks");
              clearMessages();
            }}
          >
            <FiCheckSquare />
            Active Tasks ({activeTasks.length})
          </button>

          <button
            type="button"
            className={
              activeTab === "queue"
                ? "admin-add-task-button"
                : "admin-task-cancel-button"
            }
            onClick={() => {
              setActiveTab("queue");
              clearMessages();
            }}
          >
            <FiUserCheck />
            Client Queue ({clientQueue.length})
          </button>

          <button
            type="button"
            className={
              activeTab === "archived"
                ? "admin-add-task-button"
                : "admin-task-cancel-button"
            }
            onClick={() => {
              setActiveTab("archived");
              clearMessages();
            }}
          >
            <FiArchive />
            Archived ({archivedTasks.length})
          </button>
        </div>

        <div className="admin-task-toolbar">
          <div>
            <h2>
              {activeTab === "tasks" && "Active Tasks"}
              {activeTab === "queue" &&
                "Client Request Queue"}
              {activeTab === "archived" &&
                "Archived History"}
            </h2>

            <p>{displayedTasks.length} records</p>
          </div>

          <div className="admin-task-filters">
            <div className="admin-task-search">
              <FiSearch />

              <input
                type="text"
                placeholder="Search task, client or employee..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            {activeTab === "tasks" && (
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">
                  In Progress
                </option>
                <option value="Done">Done</option>
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="admin-task-state">
            Loading task data...
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="admin-task-state">
            No records found.
          </div>
        ) : (
          <div className="admin-task-table-wrapper">
            <table className="admin-task-table">
              <thead>
                <tr>
                  <th>Task / Request</th>
                  <th>
                    {activeTab === "queue"
                      ? "Client"
                      : "Assigned Employee"}
                  </th>
                  <th>Priority</th>
                  <th>
                    {activeTab === "archived"
                      ? "Archived Date"
                      : "Due Date"}
                  </th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {displayedTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div className="admin-task-title-cell">
                        <strong>{task.title}</strong>

                        <span>
                          {getTaskTypeLabel(task)} •{" "}
                          {task.projectName ||
                            "Employee Portal"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {activeTab === "queue" ? (
                        <div className="admin-task-employee">
                          <div className="admin-task-avatar">
                            {task.createdByClient?.name
                              ?.charAt(0)
                              .toUpperCase() || "C"}
                          </div>

                          <div>
                            <strong>
                              {task.createdByClient?.name ||
                                "Client"}
                            </strong>

                            <span>
                              {task.createdByClient?.email ||
                                "-"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="admin-task-employee">
                          <div className="admin-task-avatar">
                            {task.assignedTo?.name
                              ?.charAt(0)
                              .toUpperCase() || "E"}
                          </div>

                          <div>
                            <strong>
                              {task.assignedTo?.name ||
                                "Not Assigned"}
                            </strong>

                            <span>
                              {task.assignedTo?.employeeId ||
                                "-"}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>

                    <td>
                      <span
                        className={getPriorityClass(
                          task.priority
                        )}
                      >
                        {task.priority || "Medium"}
                      </span>
                    </td>

                    <td>
                      {activeTab === "archived"
                        ? formatDate(task.closedAt)
                        : formatDate(task.dueDate)}
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          task.status
                        )}
                      >
                        {task.status || "Pending"}
                      </span>
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {activeTab === "queue" && (
                          <button
                            type="button"
                            className="admin-add-task-button"
                            style={{
                              padding: "8px 12px",
                            }}
                            onClick={() =>
                              openAssignModal(task)
                            }
                          >
                            <FiUserCheck />
                            Assign
                          </button>
                        )}

                        <button
                          type="button"
                          className="admin-task-archive-button"
                          onClick={() =>
                            openCommentModal(task)
                          }
                          title="View or add comments"
                        >
                          <FiMessageSquare />
                        </button>

                        {activeTab !== "archived" && (
                          <button
                            type="button"
                            className="admin-task-archive-button"
                            onClick={() =>
                              handleArchiveTask(task)
                            }
                            title="Archive task"
                            disabled={actionLoading}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showTaskForm && (
        <div className="admin-task-modal-overlay">
          <div className="admin-task-modal">
            <div className="admin-task-modal-header">
              <div>
                <h2>Assign New Task</h2>
                <p>
                  Create and assign an internal task.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
              >
                <FiX />
              </button>
            </div>

            <form
              className="admin-task-form"
              onSubmit={handleCreateTask}
            >
              <div className="admin-task-form-group full-width">
                <label htmlFor="title">
                  Task Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="admin-task-form-group full-width">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Enter task description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="admin-task-form-group">
                <label htmlFor="projectName">
                  Project Name
                </label>

                <input
                  id="projectName"
                  name="projectName"
                  type="text"
                  value={formData.projectName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="admin-task-form-group">
                <label htmlFor="assignedTo">
                  Assign Employee
                </label>

                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.name} (
                      {employee.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-task-form-group">
                <label htmlFor="priority">
                  Priority
                </label>

                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="High">High</option>
                  <option value="Urgent">
                    Urgent
                  </option>
                </select>
              </div>

              <div className="admin-task-form-group">
                <label htmlFor="dueDate">
                  Due Date
                </label>

                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="admin-task-form-actions">
                <button
                  type="button"
                  className="admin-task-cancel-button"
                  onClick={() =>
                    setShowTaskForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-task-submit-button"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Assigning..."
                    : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedRequest && (
        <div className="admin-task-modal-overlay">
          <div className="admin-task-modal">
            <div className="admin-task-modal-header">
              <div>
                <h2>Assign Client Request</h2>
                <p>{selectedRequest.title}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAssignModal(false)
                }
              >
                <FiX />
              </button>
            </div>

            <form
              className="admin-task-form"
              onSubmit={handleAssignRequest}
            >
              <div className="admin-task-form-group full-width">
                <label>Request Description</label>

                <textarea
                  rows="4"
                  value={selectedRequest.description || ""}
                  disabled
                />
              </div>

              <div className="admin-task-form-group">
                <label htmlFor="requestEmployee">
                  Assign Employee
                </label>

                <select
                  id="requestEmployee"
                  value={assignmentData.assignedTo}
                  onChange={(event) =>
                    setAssignmentData(
                      (previousData) => ({
                        ...previousData,
                        assignedTo:
                          event.target.value,
                      })
                    )
                  }
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.name} (
                      {employee.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-task-form-group">
                <label htmlFor="requestDueDate">
                  Due Date
                </label>

                <input
                  id="requestDueDate"
                  type="date"
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  value={assignmentData.dueDate}
                  onChange={(event) =>
                    setAssignmentData(
                      (previousData) => ({
                        ...previousData,
                        dueDate: event.target.value,
                      })
                    )
                  }
                />
              </div>

              <div className="admin-task-form-actions">
                <button
                  type="button"
                  className="admin-task-cancel-button"
                  onClick={() =>
                    setShowAssignModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-task-submit-button"
                  disabled={actionLoading}
                >
                  <FiUserCheck />
                  {actionLoading
                    ? "Assigning..."
                    : "Assign Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCommentModal && selectedTask && (
        <div className="admin-task-modal-overlay">
          <div className="admin-task-modal">
            <div className="admin-task-modal-header">
              <div>
                <h2>Request Comments</h2>
                <p>{selectedTask.title}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCommentModal(false)
                }
              >
                <FiX />
              </button>
            </div>

            <div
              style={{
                maxHeight: "280px",
                overflowY: "auto",
                marginBottom: "20px",
              }}
            >
              {!selectedTask.comments ||
              selectedTask.comments.length === 0 ? (
                <div className="admin-task-state">
                  No comments yet.
                </div>
              ) : (
                selectedTask.comments.map(
                  (comment, index) => (
                    <div
                      key={comment._id || index}
                      style={{
                        border: "1px solid #e8eaf2",
                        borderRadius: "10px",
                        padding: "12px",
                        marginBottom: "10px",
                      }}
                    >
                      <strong>
                        {comment.createdBy?.name ||
                          "User"}
                      </strong>

                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                      >
                        {comment.createdBy?.role || ""}
                      </span>

                      <p
                        style={{
                          margin: "8px 0 0",
                        }}
                      >
                        {comment.message}
                      </p>

                      <small>
                        {formatDate(comment.createdAt)}
                      </small>
                    </div>
                  )
                )
              )}
            </div>

            <form
              className="admin-task-form"
              onSubmit={handleAddComment}
            >
              <div className="admin-task-form-group full-width">
                <label htmlFor="commentMessage">
                  Add Comment
                </label>

                <textarea
                  id="commentMessage"
                  rows="3"
                  placeholder="Write a comment..."
                  value={commentMessage}
                  onChange={(event) =>
                    setCommentMessage(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-task-form-actions">
                <button
                  type="button"
                  className="admin-task-cancel-button"
                  onClick={() =>
                    setShowCommentModal(false)
                  }
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="admin-task-submit-button"
                  disabled={actionLoading}
                >
                  <FiSend />
                  {actionLoading
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

export default AdminTasks;