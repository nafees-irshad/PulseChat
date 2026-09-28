import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/loginApi.js";
import LoginCard from "../../components/users/loginCard.jsx";
import { useAuth } from "../../context/useAuth.js";

function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <main className="flex min-h-0 flex-1 items-center justify-center py-3">
      <LoginCard
        email={form.email}
        password={form.password}
        error={error}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </main>
  );
}

export default LoginPage;
