import axios from "axios";

const API_URL = "http://localhost:5000/api/attendance";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllAttendance = async (date = "") => {
  const url = date
    ? `${API_URL}/all?date=${date}`
    : `${API_URL}/all`;

  const response = await axios.get(url, getAuthConfig());

  return response.data;
};