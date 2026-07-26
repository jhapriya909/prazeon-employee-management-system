import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getTodayAttendance = async () => {
  const response = await axios.get(
    `${API_URL}/attendance/today`,
    getAuthConfig()
  );

  return response.data;
};

export const checkInEmployee = async () => {
  const response = await axios.post(
    `${API_URL}/attendance/check-in`,
    {},
    getAuthConfig()
  );

  return response.data;
};

export const getEmployeeLeaves = async () => {
  const response = await axios.get(
    `${API_URL}/leave/my`,
    getAuthConfig()
  );

  return response.data;
};

export const getEmployeeTasks = async () => {
  const response = await axios.get(
    `${API_URL}/tasks/my`,
    getAuthConfig()
  );

  return response.data;
};

export const getAdminDashboardData = async () => {
  const response = await axios.get(
    `${API_URL}/dashboard/admin`,
    getAuthConfig()
  );

  return response.data;
};