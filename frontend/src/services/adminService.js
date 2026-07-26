import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all employees
export const getAllEmployees = async (params = {}) => {
  const response = await axios.get(`${API_URL}/employees`, {
    ...getAuthConfig(),
    params,
  });

  return response.data;
};

// Get single employee
export const getEmployeeById = async (id) => {
  const response = await axios.get(
    `${API_URL}/employees/${id}`,
    getAuthConfig()
  );

  return response.data;
};

// Create employee
export const createEmployee = async (employeeData) => {
  const response = await axios.post(
    `${API_URL}/employees`,
    employeeData,
    getAuthConfig()
  );

  return response.data;
};

// Update employee
export const updateEmployee = async (id, employeeData) => {
  const response = await axios.put(
    `${API_URL}/employees/${id}`,
    employeeData,
    getAuthConfig()
  );

  return response.data;
};

// Activate / Deactivate employee
export const updateEmployeeStatus = async (id, isActive) => {
  const response = await axios.patch(
    `${API_URL}/employees/${id}/status`,
    { isActive },
    getAuthConfig()
  );

  return response.data;
};

// Employee statistics
export const getEmployeeStats = async () => {
  const response = await axios.get(
    `${API_URL}/employees/stats`,
    getAuthConfig()
  );

  return response.data;
};