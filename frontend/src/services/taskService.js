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

export const getMyTasks = async () => {
  const response = await axios.get(
    `${API_URL}/tasks/my`,
    getAuthConfig()
  );

  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await axios.put(
    `${API_URL}/tasks/${taskId}/status`,
    { status },
    getAuthConfig()
  );

  return response.data;
};

export const addTaskComment = async (taskId, message) => {
  const response = await axios.post(
    `${API_URL}/tasks/${taskId}/comments`,
    { message },
    getAuthConfig()
  );

  return response.data;
};