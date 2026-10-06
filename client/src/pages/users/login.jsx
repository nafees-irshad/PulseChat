import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { login, loginWithGoogle } from "../../api/loginApi.js";
import LoginCard from "../../components/users/loginCard.jsx";
import { useAuth } from "../../context/useAuth.js";

function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(form);
      if (!result?.token) {
        setError("The server did not return an authentication token.");
        return;
      }
      setToken(result.token);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.msg ||
          "We couldn't log you in. Check your details and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(response) {
    setError("");
    setIsGoogleSubmitting(true);

    try {
      const result = await loginWithGoogle(response.access_token);
      if (!result?.token) {
        setError("The server did not return an authentication token.");
        return;
      }
      setToken(result.token);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't log you in with Google. Please try again.",
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  const startGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google sign-in was unsuccessful. Please try again."),
    scope: "openid email profile",
  });

  return (
    <main className="flex min-h-0 flex-1 items-center justify-center py-3">
      <LoginCard
        email={form.email}
        password={form.password}
        error={error}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onGoogleLogin={() => {
          setError("");
          startGoogleLogin();
        }}
        isGoogleSubmitting={isGoogleSubmitting}
      />
    </main>
  );
}

export default LoginPage;
