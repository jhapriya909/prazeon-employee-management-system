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

export const getAllEmployees = async (params = {}) => {
  const response = await axios.get(
    `${API_URL}/employees`,
    {
      ...getAuthConfig(),
      params,
    }
  );

  return response.data;
};

export const getEmployeeById = async (employeeId) => {
  const response = await axios.get(
    `${API_URL}/employees/${employeeId}`,
    getAuthConfig()
  );

  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await axios.post(
    `${API_URL}/employees`,
    employeeData,
    getAuthConfig()
  );

  return response.data;
};

export const updateEmployee = async (
  employeeId,
  employeeData
) => {
  const response = await axios.put(
    `${API_URL}/employees/${employeeId}`,
    employeeData,
    getAuthConfig()
  );

  return response.data;
};

export const updateEmployeeStatus = async (
  employeeId,
  isActive
) => {
  const response = await axios.patch(
    `${API_URL}/employees/${employeeId}/status`,
    { isActive },
    getAuthConfig()
  );

  return response.data;
};