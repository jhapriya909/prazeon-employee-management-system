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

export const getTodayAttendance = async () => {
  const response = await axios.get(
    `${API_URL}/attendance/today`,
    getAuthConfig()
  );

  return response.data;
};

export const getAttendanceHistory = async () => {
  const response = await axios.get(
    `${API_URL}/attendance/history`,
    getAuthConfig()
  );

  return response.data;
};

export const checkIn = async () => {
  const response = await axios.post(
    `${API_URL}/attendance/check-in`,
    {},
    getAuthConfig()
  );

  return response.data;
};

export const checkOut = async () => {
  const response = await axios.put(
    `${API_URL}/attendance/check-out`,
    {},
    getAuthConfig()
  );

  return response.data;
};