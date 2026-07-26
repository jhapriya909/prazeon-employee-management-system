import { useEffect, useState } from "react";
import {
  FiBriefcase,
  FiEdit2,
  FiMail,
  FiPhone,
  FiSave,
  FiUser,
  FiX,
} from "react-icons/fi";

import {
  getMyProfile,
  updateMyProfile,
} from "../../services/profileService";

import "../../styles/profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    profileImage: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
    designation: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyProfile();
      const user = response.user || {};

      setProfile(user);

      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        department: user.department || "",
        designation: user.designation || "",
        profileImage: user.profileImage || "",
      });
    } catch (requestError) {
      console.error("Profile loading error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleEdit = () => {
    setFormData({
      name: profile.name || "",
      phone: profile.phone || "",
      department: profile.department || "",
      designation: profile.designation || "",
      profileImage: profile.profileImage || "",
    });

    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || "",
      phone: profile.phone || "",
      department: profile.department || "",
      designation: profile.designation || "",
      profileImage: profile.profileImage || "",
    });

    setIsEditing(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateMyProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        profileImage: formData.profileImage.trim(),
      });

      const updatedUser = response.user;

      setProfile(updatedUser);

      setFormData({
        name: updatedUser.name || "",
        phone: updatedUser.phone || "",
        department: updatedUser.department || "",
        designation: updatedUser.designation || "",
        profileImage: updatedUser.profileImage || "",
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          ...updatedUser,
        })
      );

      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (requestError) {
      console.error("Profile update error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitial = () => {
    return profile.name?.charAt(0)?.toUpperCase() || "E";
  };

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-heading">
        <div>
          <h2>Profile</h2>
          <p>View and manage your personal information.</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="profile-edit-button"
            onClick={handleEdit}
          >
            <FiEdit2 />
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="profile-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="profile-message success">
          {success}
        </div>
      )}

      <div className="profile-layout">
        <article className="profile-summary-card">
          <div className="profile-avatar">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
              />
            ) : (
              <span>{getInitial()}</span>
            )}
          </div>

          <h3>{profile.name}</h3>
          <p>{profile.designation || "Employee"}</p>

          <span className="profile-role-badge">
            {profile.department || "Department"}
          </span>

          <div className="profile-id-box">
            <span>Employee ID</span>
            <strong>
              {profile.employeeId || "--"}
            </strong>
          </div>
        </article>

        <article className="profile-details-card">
          <div className="profile-card-heading">
            <div>
              <h3>Personal Information</h3>
              <p>Your account and employment details.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label htmlFor="name">
                  <FiUser />
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={
                    isEditing
                      ? formData.name
                      : profile.name
                  }
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="email">
                  <FiMail />
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={profile.email || ""}
                  disabled
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="phone">
                  <FiPhone />
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={
                    isEditing
                      ? formData.phone
                      : profile.phone || ""
                  }
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="department">
                  <FiBriefcase />
                  Department
                </label>

                <input
                  id="department"
                  name="department"
                  type="text"
                  value={
                    isEditing
                      ? formData.department
                      : profile.department || ""
                  }
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group profile-full-width">
                <label htmlFor="designation">
                  <FiBriefcase />
                  Designation
                </label>

                <input
                  id="designation"
                  name="designation"
                  type="text"
                  value={
                    isEditing
                      ? formData.designation
                      : profile.designation || ""
                  }
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <div className="profile-form-group profile-full-width">
                  <label htmlFor="profileImage">
                    Profile Image URL
                  </label>

                  <input
                    id="profileImage"
                    name="profileImage"
                    type="url"
                    placeholder="Paste profile image URL"
                    value={formData.profileImage}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <FiX />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  <FiSave />
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </article>
      </div>
    </section>
  );
}

export default Profile;
