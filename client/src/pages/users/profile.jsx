import { useEffect, useState } from "react";
import { getProfile } from "../../api/profileApi.js";
import ProfileCard from "../../components/users/profileCard.jsx";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
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
    setPasswordNotice("");
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordNotice("The new passwords do not match.");
      return;
    }
    setPasswordNotice(
      "Password updates are not available yet because the server has no password-update endpoint.",
    );
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-8">
      <ProfileCard
        profile={profile}
        isLoading={isLoading}
        error={error}
        passwordForm={passwordForm}
        passwordNotice={passwordNotice}
        onPasswordChange={handlePasswordChange}
        onPasswordSubmit={handlePasswordSubmit}
      />
    </main>
  );
}

export default ProfilePage;
