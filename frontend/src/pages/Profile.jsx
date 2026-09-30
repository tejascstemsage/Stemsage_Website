import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, uploadProfilePicture } from "../services/userService";
import Footer from "../components/common/Footer";
import { User, CheckCircle2, AlertCircle, Edit3, Save, X, LogOut, Camera, Upload } from "lucide-react";

function Profile() {
  const { user, token, isAuthenticated, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    gender: "prefer_not_to_say",
    profilePicture: "",
    role: "user",
    authProvider: "local",
    isEmailVerified: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "prefer_not_to_say",
    profilePicture: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // Fetch current user data from GET /api/auth/me
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError("");
        const response = await getProfile(token);
        if (response.success && response.data?.user && isMounted) {
          const fetchedUser = response.data.user;
          setProfileData(fetchedUser);
          setFormData({
            name: fetchedUser.name || "",
            phone: fetchedUser.phone || "",
            gender: fetchedUser.gender || "prefer_not_to_say",
            profilePicture: fetchedUser.profilePicture || "",
          });
          // Synchronize AuthContext
          updateUser(fetchedUser);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Profile load error:", err);
          setError(err.message || "Failed to load user profile.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    setFormData({
      name: profileData.name || "",
      phone: profileData.phone || "",
      gender: profileData.gender || "prefer_not_to_say",
      profilePicture: profileData.profilePicture || "",
    });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setSuccess("");

    // Validate file type (JPG, JPEG, PNG, WebP)
    const validMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validMimeTypes.includes(file.type.toLowerCase())) {
      setError("Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds maximum limit of 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Generate local preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    try {
      setUploadingPhoto(true);
      const response = await uploadProfilePicture(token, file);
      if (response.success && response.data?.user) {
        const updatedUser = response.data.user;
        setProfileData(updatedUser);
        setFormData((prev) => ({
          ...prev,
          profilePicture: updatedUser.profilePicture || "",
        }));
        updateUser(updatedUser);
        setSuccess("Profile picture updated successfully!");
      } else {
        setError(response.message || "Failed to upload profile picture.");
      }
    } catch (err) {
      console.error("Profile picture upload error:", err);
      setError(err.message || "An error occurred while uploading profile picture.");
    } finally {
      setUploadingPhoto(false);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }

    try {
      setSaving(true);
      const response = await updateProfile(token, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        profilePicture: formData.profilePicture.trim(),
      });

      if (response.success && response.data?.user) {
        const updatedUser = response.data.user;
        setProfileData(updatedUser);
        updateUser(updatedUser);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError(response.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "An error occurred while saving profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between font-sans">
      <main className="flex-1 pb-20 pt-12">
        {/* Page Title Header */}
        <section className="mx-auto max-w-4xl px-6 text-center mb-10 sm:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
            My <span className="text-red-600">Profile</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-14 bg-red-600 rounded-full" />
          <p className="mt-6 text-sm sm:text-base text-slate-600">
            Manage your STEMSAGE account and personal information.
          </p>
        </section>

        <div className="mx-auto max-w-4xl px-6 sm:px-8 space-y-6">
          {/* Feedback Banners */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-700 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-red-600 mb-3" />
              <p className="text-sm font-medium">Loading profile details...</p>
            </div>
          ) : (
            <>
              {/* Top Profile Header Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  {/* Profile Picture / Cloudinary Photo Avatar */}
                  <div className="relative group h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-red-100 bg-red-50 text-red-600 flex items-center justify-center font-extrabold text-2xl overflow-hidden shrink-0 shadow-sm">
                    {photoPreview || profileData.profilePicture ? (
                      <img
                        src={photoPreview || profileData.profilePicture}
                        alt={profileData.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          if (!photoPreview) e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    {!(photoPreview || profileData.profilePicture) && (
                      <span>{profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}</span>
                    )}

                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}

                    {!uploadingPhoto && (
                      <label
                        htmlFor="profile-photo-input"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                        title="Upload Profile Photo"
                      >
                        <Camera size={20} />
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Change</span>
                      </label>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    id="profile-photo-input"
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {profileData.name || "User"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">{profileData.email}</p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {profileData.authProvider === "google" ? "Google Account" : "STEMSAGE Local Account"}
                      </span>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition cursor-pointer"
                      >
                        <Camera size={12} />
                        <span>{uploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setSuccess("");
                        setError("");
                      }}
                      className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 shadow-sm transition cursor-pointer flex items-center gap-2"
                    >
                      <Edit3 size={14} />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider px-6 py-2.5 transition cursor-pointer flex items-center gap-2"
                    >
                      <X size={14} />
                      <span>Cancel Edit</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 font-bold text-xs uppercase tracking-wider px-5 py-2.5 transition cursor-pointer flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Edit Mode vs View Mode */}
              {isEditing ? (
                /* Edit Personal Information Form */
                <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Edit Personal Information</h3>
                    <span className="text-xs font-semibold text-slate-400">Update Profile Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9922552891"
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    {/* Gender Select */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      >
                        <option value="prefer_not_to_say">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Profile Picture URL Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Profile Picture URL
                      </label>
                      <input
                        type="url"
                        name="profilePicture"
                        value={formData.profilePicture}
                        onChange={handleInputChange}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-normal text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </div>

                    {/* Email Read-only */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Email Address <span className="font-normal text-slate-400">(Read-only)</span>
                      </label>
                      <input
                        type="email"
                        disabled
                        value={profileData.email}
                        className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-normal text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Auth Provider Read-only */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Auth Provider <span className="font-normal text-slate-400">(Read-only)</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        value={profileData.authProvider === "google" ? "Google OAuth" : "STEMSAGE Local"}
                        className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-normal text-slate-400 cursor-not-allowed uppercase"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="rounded-full border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 shadow-sm transition cursor-pointer flex items-center gap-2"
                    >
                      <Save size={14} />
                      <span>{saving ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* View Personal & Account Information Cards */
                <>
                  {/* Personal Information */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Full Name
                        </span>
                        <p className="text-sm font-semibold text-slate-900">{profileData.name || "N/A"}</p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Email Address
                        </span>
                        <p className="text-sm font-semibold text-slate-900">{profileData.email || "N/A"}</p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Phone Number
                        </span>
                        <p className="text-sm font-semibold text-slate-900">{profileData.phone || "Not provided"}</p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Gender
                        </span>
                        <p className="text-sm font-semibold text-slate-900 capitalize">
                          {profileData.gender ? profileData.gender.replace(/_/g, " ") : "Prefer not to say"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">
                      Account Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Authentication
                        </span>
                        <p className="text-sm font-semibold text-slate-900">
                          {profileData.authProvider === "google" ? "Google OAuth" : "STEMSAGE Local"}
                        </p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Verification
                        </span>
                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 size={15} className="text-red-600" />
                          <span>Verified Account</span>
                        </p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Role
                        </span>
                        <p className="text-sm font-semibold text-slate-900 capitalize">
                          {profileData.role || "User"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
