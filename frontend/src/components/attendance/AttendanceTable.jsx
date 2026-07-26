function formatTime(value) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AttendanceTable({ records = [] }) {
  if (!records.length) {
    return (
      <div
        style={{
          padding: "48px 20px",
          textAlign: "center",
          color: "#8b90a3",
        }}
      >
        No attendance records found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: "760px",
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
            <th style={headerStyle}>Employee</th>
            <th style={headerStyle}>Date</th>
            <th style={headerStyle}>Check In</th>
            <th style={headerStyle}>Check Out</th>
            <th style={headerStyle}>Working Hours</th>
            <th style={headerStyle}>Status</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => {
            const employee =
              record.employee ||
              record.user ||
              record.employeeId ||
              {};

            return (
              <tr
                key={record._id || `${employee._id}-${record.date}`}
                style={{
                  borderBottom: "1px solid #edf0f6",
                }}
              >
                <td style={cellStyle}>
                  <strong style={{ color: "#22263a" }}>
                    {employee.name || record.employeeName || "Employee"}
                  </strong>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#9297a8",
                      fontSize: "12px",
                    }}
                  >
                    {employee.employeeId ||
                      employee.email ||
                      record.employeeCode ||
                      ""}
                  </div>
                </td>

                <td style={cellStyle}>
                  {record.date
                    ? new Date(record.date).toLocaleDateString()
                    : "--"}
                </td>

                <td style={cellStyle}>
                  {formatTime(record.checkIn)}
                </td>

                <td style={cellStyle}>
                  {formatTime(record.checkOut)}
                </td>

                <td style={cellStyle}>
                  {record.workingHours ||
                    record.totalHours ||
                    "0h 0m"}
                </td>

                <td style={cellStyle}>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "6px 11px",
                      borderRadius: "999px",
                      background:
                        record.status === "Present"
                          ? "#e9f8ef"
                          : record.status === "Half Day"
                            ? "#fff4db"
                            : "#fdecec",
                      color:
                        record.status === "Present"
                          ? "#2f9b59"
                          : record.status === "Half Day"
                            ? "#b7791f"
                            : "#d44a4a",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {record.status || "Absent"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
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

export default AttendanceTable;
