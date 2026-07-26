import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiList,
  FiPlayCircle,
} from "react-icons/fi";

import {
  getMyTasks,
  updateTaskStatus,
} from "../../services/taskService";

import "../../styles/tasks.css";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    done: 0,
  });

  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyTasks();

      setTasks(response.tasks || []);
      setSummary(
        response.summary || {
          total: 0,
          pending: 0,
          inProgress: 0,
          done: 0,
        }
      );
    } catch (requestError) {
      console.error("Task loading error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load assigned tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      setUpdatingTaskId(taskId);
      setError("");
      setSuccess("");

      await updateTaskStatus(taskId, status);

      setSuccess("Task status updated successfully.");
      await loadTasks();
    } catch (requestError) {
      console.error("Task update error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update task status."
      );
    } finally {
      setUpdatingTaskId("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityClass = (priority) =>
    priority?.toLowerCase() || "medium";

  const getStatusClass = (status) => {
    if (status === "In Progress") return "progress";
    if (status === "Done") return "done";
    return "pending";
  };

  return (
    <section className="tasks-page">
      <div className="tasks-heading">
        <div>
          <h2>Tasks</h2>
          <p>View assigned work and update your task progress.</p>
        </div>
      </div>

      {error && <div className="tasks-message error">{error}</div>}
      {success && (
        <div className="tasks-message success">{success}</div>
      )}

      <div className="tasks-summary-grid">
        <article className="task-summary-card">
          <div className="task-summary-icon">
            <FiList />
          </div>

          <div>
            <span>Total Tasks</span>
            <strong>{loading ? "--" : summary.total}</strong>
          </div>
        </article>

        <article className="task-summary-card">
          <div className="task-summary-icon">
            <FiClock />
          </div>

          <div>
            <span>Pending</span>
            <strong>{loading ? "--" : summary.pending}</strong>
          </div>
        </article>

        <article className="task-summary-card">
          <div className="task-summary-icon">
            <FiPlayCircle />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{loading ? "--" : summary.inProgress}</strong>
          </div>
        </article>

        <article className="task-summary-card">
          <div className="task-summary-icon">
            <FiCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <strong>{loading ? "--" : summary.done}</strong>
          </div>
        </article>
      </div>

      <article className="tasks-panel">
        <div className="tasks-panel-heading">
          <div>
            <h3>Assigned Tasks</h3>
            <p>Tasks assigned to you by the administrator.</p>
          </div>

          <span className="tasks-count">
            {summary.total} {summary.total === 1 ? "Task" : "Tasks"}
          </span>
        </div>

        {loading ? (
          <div className="tasks-empty-state">
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="tasks-empty-state">
            <FiCheckCircle />
            <h3>No tasks assigned</h3>
            <p>You currently have no assigned tasks.</p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map((task) => (
              <article className="task-card" key={task._id}>
                <div className="task-card-header">
                  <div>
                    <h3>{task.title}</h3>
                    <span>{task.projectName}</span>
                  </div>

                  <span
                    className={`task-priority ${getPriorityClass(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>

                <p className="task-description">
                  {task.description}
                </p>

                <div className="task-details-grid">
                  <div>
                    <span>Assigned by</span>
                    <strong>
                      {task.assignedBy?.name || "Administrator"}
                    </strong>
                  </div>

                  <div>
                    <span>Due date</span>
                    <strong>{formatDate(task.dueDate)}</strong>
                  </div>

                  <div>
                    <span>Current status</span>
                    <span
                      className={`task-status ${getStatusClass(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="task-actions">
                  <button
                    type="button"
                    className="task-action secondary"
                    disabled={
                      task.status === "Pending" ||
                      updatingTaskId === task._id
                    }
                    onClick={() =>
                      handleStatusChange(task._id, "Pending")
                    }
                  >
                    Pending
                  </button>

                  <button
                    type="button"
                    className="task-action progress"
                    disabled={
                      task.status === "In Progress" ||
                      updatingTaskId === task._id
                    }
                    onClick={() =>
                      handleStatusChange(task._id, "In Progress")
                    }
                  >
                    In Progress
                  </button>

                  <button
                    type="button"
                    className="task-action complete"
                    disabled={
                      task.status === "Done" ||
                      updatingTaskId === task._id
                    }
                    onClick={() =>
                      handleStatusChange(task._id, "Done")
                    }
                  >
                    {updatingTaskId === task._id
                      ? "Updating..."
                      : "Mark Done"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default Tasks;
