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

export const getAdminProfile = async () => {
  const response = await axios.get(
    `${API_URL}/profile/me`,
    getAuthConfig()
  );

  return response.data;
};

export const updateAdminProfile = async (profileData) => {
  const response = await axios.put(
    `${API_URL}/profile/me`,
    profileData,
    getAuthConfig()
  );

  return response.data;
};