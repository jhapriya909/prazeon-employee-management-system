import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };
};

// Admin: get all active internal tasks and client requests
export const getAllAdminTasks = async () => {
  const response = await axios.get(
    `${API_URL}/tasks/all`,
    getAuthConfig()
  );

  return response.data;
};

// Admin: get active employees for task assignment
export const getEmployeesForTask = async () => {
  const response = await axios.get(
    `${API_URL}/auth/users`,
    getAuthConfig()
  );

  return response.data;
};

// Admin: create internal task
export const createAdminTask = async (taskData) => {
  const response = await axios.post(
    `${API_URL}/tasks/create`,
    taskData,
    getAuthConfig()
  );

  return response.data;
};

// Admin: get unassigned client request queue
export const getClientRequestQueue = async () => {
  const response = await axios.get(
    `${API_URL}/tasks/client-queue`,
    getAuthConfig()
  );

  return response.data;
};

// Admin: assign client request to employee
export const assignClientRequest = async (
  requestId,
  assignmentData
) => {
  const response = await axios.put(
    `${API_URL}/tasks/${requestId}/assign`,
    assignmentData,
    getAuthConfig()
  );

  return response.data;
};

// Admin: add comment to internal task or client request
export const addAdminTaskComment = async (
  taskId,
  message
) => {
  const response = await axios.post(
    `${API_URL}/tasks/${taskId}/comments`,
    { message },
    getAuthConfig()
  );

  return response.data;
};

// Admin: archive task or client request
export const archiveAdminTask = async (taskId) => {
  const response = await axios.put(
    `${API_URL}/tasks/${taskId}/archive`,
    {},
    getAuthConfig()
  );

  return response.data;
};

// Admin: get archived task/request history
export const getArchivedAdminTasks = async () => {
  const response = await axios.get(
    `${API_URL}/tasks/archived`,
    getAuthConfig()
  );

  return response.data;
};