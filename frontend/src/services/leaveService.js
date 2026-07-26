import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const applyLeave = async (leaveData) => {
  const response = await axios.post(
    `${API_URL}/leaves/apply`,
    leaveData,
    getAuthConfig()
  );

  return response.data;
};

export const getMyLeaves = async () => {
  const response = await axios.get(
    `${API_URL}/leaves/my`,
    getAuthConfig()
  );

  return response.data;
};

export const getAllLeaves = async () => {
  const response = await axios.get(
    `${API_URL}/leaves/all`,
    getAuthConfig()
  );

  return response.data;
};

export const approveLeaveRequest = async (leaveId) => {
  const response = await axios.put(
    `${API_URL}/leaves/${leaveId}/approve`,
    {},
    getAuthConfig()
  );

  return response.data;
};

export const rejectLeaveRequest = async (
  leaveId,
  rejectionReason
) => {
  const response = await axios.put(
    `${API_URL}/leaves/${leaveId}/reject`,
    { rejectionReason },
    getAuthConfig()
  );

  return response.data;
};