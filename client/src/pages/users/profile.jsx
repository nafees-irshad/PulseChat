import { useEffect, useState } from "react";
import { changePassword, getProfile } from "../../api/profileApi.js";
import ProfileCard from "../../components/users/profileCard.jsx";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState({ message: "", isError: false });
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let isActive = true;

    getProfile()
      .then((data) => {
        if (isActive) setProfile(data);
      })
      .catch((requestError) => {
        if (isActive) {
          setError(
            requestError.response?.data?.message ||
              requestError.response?.data?.error ||
              "Unable to load your profile. Please log in again.",
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordFeedback({ message: "", isError: false });
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (!passwordForm.currentPassword) {
      setPasswordFeedback({ message: "Enter your current password.", isError: true });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ message: "The new passwords do not match.", isError: true });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({ message: "Password must be at least 8 characters long.", isError: true });
      return;
    }
    if (new TextEncoder().encode(passwordForm.newPassword).length > 72) {
      setPasswordFeedback({ message: "Password must be no more than 72 UTF-8 bytes.", isError: true });
      return;
    }

    setIsPasswordSubmitting(true);
    setPasswordFeedback({ message: "", isError: false });
    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordFeedback({ message: result.message, isError: false });
    } catch (requestError) {
      setPasswordFeedback({
        message: requestError.response?.data?.message || "Unable to update your password. Please try again.",
        isError: true,
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-8">
      <ProfileCard
        profile={profile}
        isLoading={isLoading}
        error={error}
        passwordForm={passwordForm}
        passwordFeedback={passwordFeedback}
        isPasswordSubmitting={isPasswordSubmitting}
        onPasswordChange={handlePasswordChange}
        onPasswordSubmit={handlePasswordSubmit}
      />
    </main>
  );
}

export default ProfilePage;
