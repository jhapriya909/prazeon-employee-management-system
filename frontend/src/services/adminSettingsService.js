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
  };
};

// Get Admin Profile
export const getAdminProfile = async () => {
  const response = await axios.get(
    `${API_URL}/me`,
    getAuthConfig()
  );

  return response.data;
};

// Update Admin Profile
export const updateAdminProfile = async (profileData) => {
  const response = await axios.put(
    `${API_URL}/me`,
    profileData,
    getAuthConfig()
  );

  return response.data;
};