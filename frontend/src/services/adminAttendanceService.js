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

export const getAllAttendance = async (date = "") => {
  const response = await axios.get(
    `${API_URL}/attendance/all`,
    {
      ...getAuthConfig(),
      params: date ? { date } : {},
    }
  );

  return response.data;
};
