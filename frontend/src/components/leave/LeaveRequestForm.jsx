import { useState } from "react";

function LeaveRequestForm({
  onSubmit,
  loading = false,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    leaveType: "casual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason.trim()
    ) {
      return;
    }

    await onSubmit?.(formData);

    setFormData({
      leaveType: "casual",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={formGridStyle}>
        <div style={groupStyle}>
          <label style={labelStyle}>Leave Type</label>

          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="earned">Earned Leave</option>
          </select>
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>Start Date</label>

          <input
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>

        <div style={groupStyle}>
          <label style={labelStyle}>End Date</label>

          <input
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate}
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div style={{ ...groupStyle, marginTop: "17px" }}>
        <label style={labelStyle}>Reason</label>

        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Describe the reason for your leave"
          rows="4"
          style={{
            ...inputStyle,
            height: "auto",
            padding: "13px",
            resize: "vertical",
          }}
          required
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "11px",
          marginTop: "20px",
        }}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={secondaryButtonStyle}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          style={primaryButtonStyle}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "16px",
};

const groupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  color: "#35394d",
  fontSize: "13px",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  height: "46px",
  padding: "0 13px",
  border: "1px solid #e1e4ed",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#292d40",
  outline: "none",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  minWidth: "145px",
  height: "43px",
  border: "none",
  borderRadius: "9px",
  background: "#6557e8",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  minWidth: "95px",
  height: "43px",
  border: "1px solid #e1e4ed",
  borderRadius: "9px",
  background: "#ffffff",
  color: "#656a7e",
  cursor: "pointer",
  fontWeight: 600,
};

export default LeaveRequestForm;
