import { FiClock, FiLogIn, FiLogOut } from "react-icons/fi";

function CheckInOutCard({
  todayAttendance,
  loading = false,
  onCheckIn,
  onCheckOut,
}) {
  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);

  const formatTime = (value) => {
    if (!value) return "--:--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "16px",
        background: "#ffffff",
        border: "1px solid #eceef5",
        boxShadow: "0 8px 24px rgba(32, 37, 67, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "22px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#24283b",
              fontSize: "18px",
            }}
          >
            Today&apos;s Attendance
          </h3>

          <p
            style={{
              margin: "6px 0 0",
              color: "#9296a8",
              fontSize: "13px",
            }}
          >
            Mark your daily check-in and check-out.
          </p>
        </div>

        <FiClock size={22} color="#6557e8" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div style={timeBoxStyle}>
          <span style={labelStyle}>Check In</span>
          <strong style={timeStyle}>
            {formatTime(todayAttendance?.checkIn)}
          </strong>
        </div>

        <div style={timeBoxStyle}>
          <span style={labelStyle}>Check Out</span>
          <strong style={timeStyle}>
            {formatTime(todayAttendance?.checkOut)}
          </strong>
        </div>
      </div>

      {!hasCheckedIn ? (
        <button
          type="button"
          onClick={onCheckIn}
          disabled={loading}
          style={primaryButtonStyle}
        >
          <FiLogIn />
          {loading ? "Please wait..." : "Check In"}
        </button>
      ) : !hasCheckedOut ? (
        <button
          type="button"
          onClick={onCheckOut}
          disabled={loading}
          style={primaryButtonStyle}
        >
          <FiLogOut />
          {loading ? "Please wait..." : "Check Out"}
        </button>
      ) : (
        <div
          style={{
            padding: "13px",
            borderRadius: "10px",
            background: "#eaf8ef",
            color: "#36945a",
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Attendance completed for today
        </div>
      )}
    </div>
  );
}

const timeBoxStyle = {
  padding: "17px",
  borderRadius: "12px",
  background: "#f8f9fd",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#9296a8",
  fontSize: "12px",
};

const timeStyle = {
  color: "#25293d",
  fontSize: "19px",
};

const primaryButtonStyle = {
  width: "100%",
  height: "45px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  border: "none",
  borderRadius: "10px",
  background: "#6557e8",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 600,
};

export default CheckInOutCard;
