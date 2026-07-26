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

export const getMyProfile = async () => {
  const response = await axios.get(
    `${API_URL}/me`,
    getAuthConfig()
  );

  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await axios.put(
    `${API_URL}/me`,
    profileData,
    getAuthConfig()
  );

  return response.data;
};