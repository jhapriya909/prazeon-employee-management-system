function LeaveTable({ leaves = [] }) {
  if (!leaves.length) {
    return (
      <div
        style={{
          padding: "48px 20px",
          textAlign: "center",
          color: "#8b90a3",
        }}
      >
        No leave requests found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          minWidth: "760px",
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
            <th style={headerStyle}>Leave Type</th>
            <th style={headerStyle}>From</th>
            <th style={headerStyle}>To</th>
            <th style={headerStyle}>Days</th>
            <th style={headerStyle}>Reason</th>
            <th style={headerStyle}>Status</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((leave) => (
            <tr
              key={leave._id}
              style={{
                borderBottom: "1px solid #edf0f6",
              }}
            >
              <td style={cellStyle}>
                {leave.leaveType || leave.type || "--"}
              </td>

              <td style={cellStyle}>
                {leave.startDate
                  ? new Date(leave.startDate).toLocaleDateString()
                  : "--"}
              </td>

              <td style={cellStyle}>
                {leave.endDate
                  ? new Date(leave.endDate).toLocaleDateString()
                  : "--"}
              </td>

              <td style={cellStyle}>
                {leave.totalDays || leave.days || "--"}
              </td>

              <td
                style={{
                  ...cellStyle,
                  maxWidth: "260px",
                }}
              >
                {leave.reason || "--"}
              </td>

              <td style={cellStyle}>
                <span style={getStatusStyle(leave.status)}>
                  {leave.status || "Pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getStatusStyle(status = "Pending") {
  const lowerStatus = status.toLowerCase();

  let background = "#fff4db";
  let color = "#b7791f";

  if (lowerStatus === "approved") {
    background = "#e9f8ef";
    color = "#2f9b59";
  }

  if (lowerStatus === "rejected") {
    background = "#fdecec";
    color = "#d44a4a";
  }

  return {
    display: "inline-flex",
    padding: "6px 11px",
    borderRadius: "999px",
    background,
    color,
    fontSize: "12px",
    fontWeight: 600,
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

export default LeaveTable;
