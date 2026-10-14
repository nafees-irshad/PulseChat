import { Link } from "react-router-dom";

function SignupCard({
  form,
  otp,
  verificationEmail,
  isOtpStep,
  verificationComplete,
  error,
  success,
  isSubmitting,
  isResending,
  isGoogleSubmitting,
  onChange,
  onOtpChange,
  onGoogleSignup,
  onSubmit,
  onResendOtp,
  onConfirmOtp,
  onBackToSignup,
}) {
  return (
    <section className="w-full max-w-[360px]" aria-labelledby="signup-title">
      <div className="mb-5 text-center">
        <h1
          id="signup-title"
          className="mb-2 text-[25px] font-medium leading-tight text-[#171717]"
        >
          {verificationComplete
            ? "Email verified"
            : isOtpStep
              ? "Verify your email"
              : "Create your account"}
        </h1>
        <p className="text-[14px] text-[#777]">
          {isOtpStep
            ? "Confirm your email address to finish creating your account."
            : "Sign up to get started with PulseAI."}
        </p>
      </div>

      {!verificationComplete && (
        <form
          className="space-y-3"
          onSubmit={isOtpStep ? onConfirmOtp : onSubmit}
        >
          {isOtpStep ? (
            <>
              <p className="text-center text-[13px] text-[#666]">
                Enter the 6-digit code sent to {verificationEmail}.
              </p>
              <label className="sr-only" htmlFor="signup-otp">
                Verification code
              </label>
              <input
                id="signup-otp"
                className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-center text-[18px] tracking-[0.3em] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={onOtpChange}
                required
              />
            </>
          ) : (
            <>
              <label className="sr-only" htmlFor="signup-name">
                Name
              </label>
              <input
                id="signup-name"
                className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-[14px] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Name"
                value={form.name}
                onChange={onChange}
                required
              />

              <label className="sr-only" htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
                className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-[14px] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                required
              />

              <label className="sr-only" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-[14px] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Password (at least 8 characters)"
                minLength={8}
                maxLength={72}
                value={form.password}
                onChange={onChange}
                required
              />
            </>
          )}

          {error && (
            <p className="text-left text-[13px] text-red-600" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-left text-[13px] text-green-700" role="status">
              {success}
            </p>
          )}

          <button
            className="h-11 w-full rounded-xl bg-black px-4 text-[14px] font-medium text-white transition hover:bg-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isOtpStep
                ? "Verifying..."
                : "Creating account..."
              : isOtpStep
                ? "Verify email"
                : "Create account"}
          </button>
          {isOtpStep && (
            <div className="space-y-2">
              <button
                className="w-full text-[13px] text-[#666] underline disabled:cursor-wait disabled:opacity-60"
                type="button"
                onClick={onResendOtp}
                disabled={isSubmitting}
              >
                {isResending ? "Sending a new code..." : "Resend code"}
              </button>
              <button
                className="w-full text-[13px] text-[#666] underline disabled:cursor-wait disabled:opacity-60"
                type="button"
                onClick={onBackToSignup}
                disabled={isSubmitting}
              >
                Back to sign up
              </button>
            </div>
          )}
        </form>
      )}

      {verificationComplete && (
        <div className="space-y-3 text-center">
          <p className="text-[14px] text-green-700" role="status">
            {success}
          </p>
          <Link
            className="inline-block text-[14px] font-medium text-[#171717] underline"
            to="/login"
          >
            Log in to your account
          </Link>
        </div>
      )}

      {!isOtpStep && !verificationComplete && (
        <>
          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-[#e7e7e7]" />
            <span className="text-[12px] text-[#666]">or</span>
            <span className="h-px flex-1 bg-[#e7e7e7]" />
          </div>

          <div className="space-y-2.5">
            <button
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 text-[14px] text-[#171717] transition hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] disabled:cursor-wait disabled:opacity-60"
              type="button"
              onClick={onGoogleSignup}
              disabled={isSubmitting || isGoogleSubmitting}
            >
              <svg
                aria-hidden="true"
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleSubmitting ? "Signing up..." : "Sign up with Google"}</span>
            </button>
          </div>
        </>
      )}

      <p className="mt-5 text-center text-[13px] text-[#777]">
        Already have an account?{" "}
        <Link className="font-medium text-[#171717] underline" to="/login">
          Log in
        </Link>
      </p>
    </section>
  );
}

export default SignupCard;
