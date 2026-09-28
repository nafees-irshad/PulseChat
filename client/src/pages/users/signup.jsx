import { useState } from "react";
import { signup } from "../../api/signupApi.js";
import SignupCard from "../../components/users/signupCard.jsx";

const emptyForm = { name: "", email: "", password: "" };

function SignupPage() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const result = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess(result?.message || "Your account has been created.");
      setForm(emptyForm);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.msg ||
          "We couldn't create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-0 flex-1 items-center justify-center py-3">
      <SignupCard
        form={form}
        error={error}
        success={success}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </main>
  );
}

export default SignupPage;
