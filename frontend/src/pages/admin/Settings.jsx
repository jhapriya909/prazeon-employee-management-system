import { useEffect, useRef, useState } from "react";
import {
  FiBriefcase,
  FiCamera,
  FiEdit3,
  FiMail,
  FiPhone,
  FiSave,
  FiShield,
  FiUser,
} from "react-icons/fi";

import {
  getAdminProfile,
  updateAdminProfile,
} from "../../services/adminSettingsService";

import "../../styles/adminSettings.css";

function AdminSettings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    profileImage: "",
    employeeId: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const imageInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminProfile();
      const user = response.user || {};

      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        designation: user.designation || "",
        profileImage: user.profileImage || "",
        employeeId: user.employeeId || "",
        role: user.role || "",
      });
    } catch (requestError) {
      console.error("Profile loading error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load admin profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setError("");
    setMessage("");
  };

  const handleImageClick = () => {
    setIsEditing(true);
    setError("");
    setMessage("");

    imageInputRef.current?.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    const maximumFileSize = 1024 * 1024;

    if (file.size > maximumFileSize) {
      setError("Profile image must be smaller than 1 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfile((previousProfile) => ({
        ...previousProfile,
        profileImage: reader.result,
      }));

      setError("");
      setMessage(
        "Image selected. Click Save Changes to save your profile picture."
      );
    };

    reader.onerror = () => {
      setError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      profileImage: "",
    }));

    setIsEditing(true);
    setError("");
    setMessage(
      "Profile image removed. Click Save Changes to confirm."
    );

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!profile.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const profileData = {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        department: profile.department.trim(),
        designation: profile.designation.trim(),
        profileImage: profile.profileImage,
      };

      const response = await updateAdminProfile(profileData);
      const updatedUser = response.user || {};

      setProfile({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        department: updatedUser.department || "",
        designation: updatedUser.designation || "",
        profileImage: updatedUser.profileImage || "",
        employeeId: updatedUser.employeeId || "",
        role: updatedUser.role || "",
      });

      setMessage(
        response.message || "Profile updated successfully."
      );

      setIsEditing(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } catch (requestError) {
      console.error("Profile update error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update admin profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setIsEditing(false);
    setMessage("");
    setError("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    await fetchProfile();
  };

  const getInitial = () => {
    return profile.name?.charAt(0)?.toUpperCase() || "A";
  };

  if (loading) {
    return (
      <section className="admin-settings-page">
        <div className="admin-settings-loading">
          Loading profile...
        </div>
      </section>
    );
  }

  return (
    <section className="admin-settings-page">
      <div className="admin-settings-heading">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your admin profile and account information.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="admin-settings-edit-button"
            onClick={handleEditProfile}
          >
            <FiEdit3 />
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className="admin-settings-success">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-settings-error">
          {error}
        </div>
      )}

      <div className="admin-settings-layout">
        <aside className="admin-profile-card">
          <div className="admin-profile-cover"></div>

          <div className="admin-profile-content">
            <div className="admin-profile-image-wrapper">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.name || "Admin"}
                  className="admin-profile-image"
                />
              ) : (
                <div className="admin-profile-initial">
                  {getInitial()}
                </div>
              )}

              <button
                type="button"
                className="admin-profile-camera"
                onClick={handleImageClick}
                title="Change profile picture"
                aria-label="Change profile picture"
              >
                <FiCamera />
              </button>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="admin-profile-file-input"
                onChange={handleImageChange}
              />
            </div>

            <h2>{profile.name || "Admin User"}</h2>

            <p>
              {profile.designation || "Administrator"}
            </p>

            <span className="admin-profile-role">
              <FiShield />
              {profile.role || "admin"}
            </span>

            <div className="admin-profile-information">
              <div>
                <span className="admin-profile-info-icon">
                  <FiMail />
                </span>

                <div>
                  <small>Email</small>
                  <strong>{profile.email || "-"}</strong>
                </div>
              </div>

              <div>
                <span className="admin-profile-info-icon">
                  <FiPhone />
                </span>

                <div>
                  <small>Phone</small>
                  <strong>
                    {profile.phone || "Not added"}
                  </strong>
                </div>
              </div>

              <div>
                <span className="admin-profile-info-icon">
                  <FiBriefcase />
                </span>

                <div>
                  <small>Department</small>
                  <strong>
                    {profile.department || "Not added"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <article className="admin-settings-form-card">
          <div className="admin-settings-form-heading">
            <div>
              <h2>Personal Information</h2>

              <p>
                Update your personal and professional details.
              </p>
            </div>

            <span>
              <FiUser />
            </span>
          </div>

          <form
            className="admin-settings-form"
            onSubmit={handleSubmit}
          >
            <div className="admin-settings-form-grid">
              <div className="admin-settings-field">
                <label htmlFor="name">Full Name</label>

                <div className="admin-settings-input-wrapper">
                  <FiUser />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="admin-settings-input-wrapper read-only">
                  <FiMail />

                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                  />
                </div>

                <small>Email cannot be changed.</small>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="admin-settings-input-wrapper">
                  <FiPhone />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="employeeId">
                  Admin ID
                </label>

                <div className="admin-settings-input-wrapper read-only">
                  <FiShield />

                  <input
                    id="employeeId"
                    type="text"
                    value={profile.employeeId}
                    disabled
                  />
                </div>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="department">
                  Department
                </label>

                <div className="admin-settings-input-wrapper">
                  <FiBriefcase />

                  <input
                    id="department"
                    name="department"
                    type="text"
                    placeholder="Enter department"
                    value={profile.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="designation">
                  Designation
                </label>

                <div className="admin-settings-input-wrapper">
                  <FiBriefcase />

                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    placeholder="Enter designation"
                    value={profile.designation}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="admin-settings-field admin-settings-full-field">
                <label>Profile Image</label>

                <div className="admin-settings-image-section">
                  <div className="admin-settings-image-note">
                    <FiCamera />

                    <span>
                      Camera icon par click karke JPG, PNG
                      ya WEBP image select karo. Maximum
                      size 1 MB.
                    </span>
                  </div>

                  <div className="admin-settings-image-buttons">
                    <button
                      type="button"
                      className="admin-settings-choose-image"
                      onClick={handleImageClick}
                    >
                      <FiCamera />
                      Choose Image
                    </button>

                    {profile.profileImage && (
                      <button
                        type="button"
                        className="admin-settings-remove-image"
                        onClick={handleRemoveImage}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="admin-settings-form-actions">
                <button
                  type="button"
                  className="admin-settings-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-settings-save-button"
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

export default AdminSettings;