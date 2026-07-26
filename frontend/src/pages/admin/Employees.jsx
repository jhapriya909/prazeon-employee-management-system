import { useEffect, useState } from "react";
import {
  createEmployee,
  getAllEmployees,
  updateEmployee,
  updateEmployeeStatus,
} from "../../services/adminService";
import "../../styles/employees.css";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEmployees: 0,
  });

  const loadEmployees = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllEmployees({
        search,
        status,
        page,
        limit: 8,
      });

      setEmployees(data.employees || []);

      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalEmployees: 0,
        }
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Employees load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, status]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData(initialFormData);
    setError("");
    setMessage("");
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      password: "",
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      joiningDate: employee.joiningDate
        ? employee.joiningDate.split("T")[0]
        : "",
    });

    setError("");
    setMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      if (editingEmployee) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
          joiningDate: formData.joiningDate,
        };

        await updateEmployee(
          editingEmployee._id,
          updateData
        );

        setMessage("Employee updated successfully.");
      } else {
        await createEmployee(formData);

        setMessage("Employee added successfully.");
      }

      closeModal();
      await loadEmployees(pagination.currentPage);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Employee save nahi ho paya."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (employee) => {
    const newStatus = !employee.isActive;

    const confirmationMessage = newStatus
      ? `Activate ${employee.name}?`
      : `Deactivate ${employee.name}?`;

    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const data = await updateEmployeeStatus(
        employee._id,
        newStatus
      );

      setMessage(data.message || "Status updated.");
      await loadEmployees(pagination.currentPage);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Employee status update nahi hua."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="employees-page">
      <div className="employees-topbar">
        <div>
          <h2>Employees</h2>
          <p>
            Manage employee records, departments and status.
          </p>
        </div>

        <button
          className="add-employee-btn"
          onClick={openAddModal}
        >
          + Add Employee
        </button>
      </div>

      {message && (
        <div className="employee-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="employee-error-message">
          {error}
        </div>
      )}

      <div className="employees-controls">
        <input
          type="text"
          placeholder="Search by name, email or ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All Employees</option>
          <option value="active">Active Employees</option>
          <option value="inactive">Inactive Employees</option>
        </select>
      </div>

      <div className="employee-count">
        Total Employees: {pagination.totalEmployees}
      </div>

      <div className="employees-table-container">
        {loading ? (
          <div className="employees-loading">
            Loading employees...
          </div>
        ) : employees.length === 0 ? (
          <div className="employees-empty">
            No employees found.
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>
                    <div className="employee-info">
                      <div className="employee-avatar">
                        {employee.profileImage ? (
                          <img
                            src={employee.profileImage}
                            alt={employee.name}
                          />
                        ) : (
                          employee.name
                            ?.charAt(0)
                            .toUpperCase()
                        )}
                      </div>

                      <div>
                        <strong>{employee.name}</strong>
                        <span>{employee.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>{employee.employeeId || "-"}</td>

                  <td>{employee.department || "-"}</td>

                  <td>{employee.designation || "-"}</td>

                  <td>
                    {employee.joiningDate
                      ? new Date(
                          employee.joiningDate
                        ).toLocaleDateString("en-IN")
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={
                        employee.isActive
                          ? "status active"
                          : "status inactive"
                      }
                    >
                      {employee.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="employee-actions">
                      <button
                        className="edit-btn"
                        onClick={() =>
                          openEditModal(employee)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className={
                          employee.isActive
                            ? "deactivate-btn"
                            : "activate-btn"
                        }
                        disabled={actionLoading}
                        onClick={() =>
                          handleStatusChange(employee)
                        }
                      >
                        {employee.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="employees-pagination">
          <button
            disabled={pagination.currentPage === 1}
            onClick={() =>
              loadEmployees(pagination.currentPage - 1)
            }
          >
            Previous
          </button>

          <span>
            Page {pagination.currentPage} of{" "}
            {pagination.totalPages}
          </span>

          <button
            disabled={
              pagination.currentPage ===
              pagination.totalPages
            }
            onClick={() =>
              loadEmployees(pagination.currentPage + 1)
            }
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div
          className="employee-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="employee-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="employee-modal-header">
              <h3>
                {editingEmployee
                  ? "Edit Employee"
                  : "Add Employee"}
              </h3>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              className="employee-form"
              onSubmit={handleSubmit}
            >
              <div className="employee-form-grid">
                <div className="employee-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="employee-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {!editingEmployee && (
                  <div className="employee-form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      minLength="6"
                      required
                    />
                  </div>
                )}

                <div className="employee-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="employee-form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Engineering"
                  />
                </div>

                <div className="employee-form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Frontend Developer"
                  />
                </div>

                <div className="employee-form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="employee-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-employee-btn"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Saving..."
                    : editingEmployee
                      ? "Update Employee"
                      : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;