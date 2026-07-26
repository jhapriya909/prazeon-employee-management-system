import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyTasks = async () => {
  const response = await axios.get(
    `${API_URL}/my`,
    getAuthConfig()
  );

  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await axios.put(
    `${API_URL}/${taskId}/status`,
    { status },
    getAuthConfig()
  );

  return response.data;
};

export const addTaskComment = async (taskId, message) => {
  const response = await axios.post(
    `${API_URL}/${taskId}/comments`,
    { message },
    getAuthConfig()
  );

  return response.data;
};