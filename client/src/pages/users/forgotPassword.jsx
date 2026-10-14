import { useState } from "react";
import { Link } from "react-router-dom";
import {
  requestPasswordReset,
  resetPassword,
} from "../../api/loginApi.js";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleRequestCode(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset(email);
      setIsCodeSent(true);
      setNotice(result.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to send a reset code. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (new TextEncoder().encode(newPassword).length > 72) {
      setError("Password must be no more than 72 UTF-8 bytes.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword({ email, otp, newPassword });
      setNotice(result.message);
      setIsComplete(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reset your password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-8">
      <section className="w-full max-w-[360px]" aria-labelledby="reset-title">
        <div className="mb-5 text-center">
          <h1
            id="reset-title"
            className="mb-2 text-[25px] font-medium leading-tight text-[#171717]"
          >
            {isComplete ? "Password reset" : "Forgot your password?"}
          </h1>
          <p className="text-[14px] text-[#777]">
            {isComplete
              ? "Your password has been updated."
              : isCodeSent
                ? `Enter the 6-digit code sent to ${email}.`
                : "Enter your email and we’ll send you a reset code."}
          </p>
        </div>

        {isComplete ? (
          <div className="space-y-4 text-center">
            <p className="text-[13px] text-emerald-700" role="status">
              {notice}
            </p>
            <Link
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-black px-4 text-[14px] font-medium text-white transition hover:bg-[#292929]"
              to="/login"
            >
              Go to log in
            </Link>
          </div>
        ) : !isCodeSent ? (
          <form className="space-y-3" onSubmit={handleRequestCode}>
            <label className="sr-only" htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-[14px] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            {error && <p className="text-[13px] text-red-600" role="alert">{error}</p>}
            <button
              className="h-11 w-full rounded-xl bg-black px-4 text-[14px] font-medium text-white transition hover:bg-[#292929] disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending code..." : "Send reset code"}
            </button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={handleResetPassword}>
            <label className="sr-only" htmlFor="reset-otp">
              Reset code
            </label>
            <input
              id="reset-otp"
              className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-center text-[16px] tracking-[0.35em] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              minLength={6}
              maxLength={6}
            />
            <label className="sr-only" htmlFor="reset-new-password">
              New password
            </label>
            <input
              id="reset-new-password"
              className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-[14px] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
              type="password"
              autoComplete="new-password"
              placeholder="New password (at least 8 characters)"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
              maxLength={72}
            />
            <label className="sr-only" htmlFor="reset-confirm-password">
              Confirm new password
            </label>
            <input
              id="reset-confirm-password"
              className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-[14px] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            {notice && <p className="text-[13px] text-emerald-700" role="status">{notice}</p>}
            {error && <p className="text-[13px] text-red-600" role="alert">{error}</p>}
            <button
              className="h-11 w-full rounded-xl bg-black px-4 text-[14px] font-medium text-white transition hover:bg-[#292929] disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting password..." : "Reset password"}
            </button>
            <button
              className="w-full py-1 text-[13px] font-medium text-[#555] underline underline-offset-2 hover:text-black disabled:opacity-60"
              type="button"
              onClick={handleRequestCode}
              disabled={isSubmitting}
            >
              Send a new code
            </button>
          </form>
        )}

        {!isComplete && (
          <p className="mt-5 text-center text-[13px] text-[#777]">
            <Link className="font-medium text-[#171717] underline" to="/login">
              Back to log in
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}

export default ForgotPasswordPage;