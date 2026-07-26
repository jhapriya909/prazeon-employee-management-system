function TaskTable({
  tasks = [],
  onStatusChange,
  updatingTaskId,
}) {
  if (!tasks.length) {
    return (
      <div
        style={{
          padding: "48px 20px",
          textAlign: "center",
          color: "#8b90a3",
        }}
      >
        No tasks found.
      </div>
    );
  }

  return (
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
              background: "#f8f9fc",
              color: "#74798d",
              textAlign: "left",
            }}
          >
            <th style={headerStyle}>Task</th>
            <th style={headerStyle}>Assigned By</th>
            <th style={headerStyle}>Priority</th>
            <th style={headerStyle}>Due Date</th>
            <th style={headerStyle}>Status</th>
            <th style={headerStyle}>Action</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr
              key={task._id}
              style={{
                borderBottom: "1px solid #edf0f6",
              }}
            >
              <td style={cellStyle}>
                <strong style={{ color: "#24283b" }}>
                  {task.title || "Untitled Task"}
                </strong>

                <div
                  style={{
                    marginTop: "5px",
                    maxWidth: "280px",
                    color: "#9498a9",
                    fontSize: "12px",
                  }}
                >
                  {task.description || ""}
                </div>
              </td>

              <td style={cellStyle}>
                {task.assignedBy?.name ||
                  task.createdBy?.name ||
                  "Admin"}
              </td>

              <td style={cellStyle}>
                <span style={getPriorityStyle(task.priority)}>
                  {task.priority || "Medium"}
                </span>
              </td>

              <td style={cellStyle}>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "--"}
              </td>

              <td style={cellStyle}>
                <span style={getStatusStyle(task.status)}>
                  {task.status || "Pending"}
                </span>
              </td>

              <td style={cellStyle}>
                <select
                  value={task.status || "Pending"}
                  onChange={(event) =>
                    onStatusChange?.(task._id, event.target.value)
                  }
                  disabled={updatingTaskId === task._id}
                  style={{
                    height: "37px",
                    padding: "0 10px",
                    border: "1px solid #e0e3ed",
                    borderRadius: "8px",
                    color: "#4d5267",
                    background: "#ffffff",
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getPriorityStyle(priority = "Medium") {
  const lower = priority.toLowerCase();

  const styles = {
    low: {
      background: "#eaf8ef",
      color: "#34945a",
    },
    medium: {
      background: "#fff4db",
      color: "#ae741d",
    },
    high: {
      background: "#fdecec",
      color: "#d34949",
    },
  };

  return {
    display: "inline-flex",
    padding: "6px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    ...(styles[lower] || styles.medium),
  };
}

function getStatusStyle(status = "Pending") {
  const lower = status.toLowerCase();

  const styles = {
    pending: {
      background: "#fff4db",
      color: "#ae741d",
    },
    "in progress": {
      background: "#e8f1ff",
      color: "#397bdc",
    },
    done: {
      background: "#eaf8ef",
      color: "#34945a",
    },
  };

  return {
    display: "inline-flex",
    padding: "6px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    ...(styles[lower] || styles.pending),
  };
}

const headerStyle = {
  padding: "15px 18px",
  fontSize: "12px",
  fontWeight: 600,
};

const cellStyle = {
  padding: "17px 18px",
  color: "#656a7d",
  fontSize: "13px",
};

export default TaskTable;
