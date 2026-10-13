import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../../api/loginApi.js";
import { confirmOtp, signup } from "../../api/signupApi.js";
import SignupCard from "../../components/users/signupCard.jsx";
import { useAuth } from "../../context/useAuth.js";

const emptyForm = { name: "", email: "", password: "" };

function SignupPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
    setSuccess("");
  }

  function handleOtpChange(event) {
    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
    setError("");
    setSuccess("");
  }

  async function requestVerificationCode(isResend = false) {
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    setIsResending(isResend);

    try {
      const result = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setVerificationEmail(result.user.email);
      setOtp("");
      setIsOtpStep(true);
      setSuccess(result?.message || "Your account has been created.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.msg ||
          "We couldn't create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setIsResending(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await requestVerificationCode();
  }

  async function handleConfirmOtp(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const result = await confirmOtp(verificationEmail, otp);
      if (!result?.user?.isVerified) {
        setError("The server could not confirm your email verification.");
        return;
      }
      setVerificationComplete(true);
      setSuccess(result.message || "Your email has been verified.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't verify your email. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(response) {
    setError("");
    setSuccess("");
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
          "We couldn't sign you up with Google. Please try again.",
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  const startGoogleSignup = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () =>
      setError("Google sign-up was unsuccessful. Please try again."),
    scope: "openid email profile",
  });

  return (
    <main className="flex min-h-0 flex-1 items-center justify-center py-3">
      <SignupCard
        form={form}
        otp={otp}
        verificationEmail={verificationEmail}
        isOtpStep={isOtpStep}
        verificationComplete={verificationComplete}
        error={error}
        success={success}
        isSubmitting={isSubmitting}
        isResending={isResending}
        isGoogleSubmitting={isGoogleSubmitting}
        onChange={handleChange}
        onOtpChange={handleOtpChange}
        onSubmit={handleSubmit}
        onResendOtp={() => requestVerificationCode(true)}
        onConfirmOtp={handleConfirmOtp}
        onBackToSignup={() => {
          setIsOtpStep(false);
          setError("");
          setSuccess("");
        }}
        onGoogleSignup={() => {
          setError("");
          setSuccess("");
          startGoogleSignup();
        }}
      />
    </main>
  );
}

export default SignupPage;
