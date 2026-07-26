import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };
};

export const getTodayAttendance = async () => {
  const response = await axios.get(`${API_URL}/today`, getAuthConfig());
  return response.data;
};

export const checkInAttendance = async () => {
  const response = await axios.post(
    `${API_URL}/check-in`,
    {},
    getAuthConfig()
  );

  return response.data;
};

export const checkOutAttendance = async () => {
  const response = await axios.put(
    `${API_URL}/check-out`,
    {},
    getAuthConfig()
  );

  return response.data;
};

export const getAttendanceHistory = async (month, year) => {
  const response = await axios.get(
    `${API_URL}/history?month=${month}&year=${year}`,
    getAuthConfig()
  );

  return response.data;
};