import { Link } from "react-router-dom";

function LoginCard({
  email,
  password,
  error,
  isSubmitting,
  isGoogleSubmitting,
  onChange,
  onGoogleLogin,
  onSubmit,
}) {
  return (
    <section className="w-full max-w-[360px]" aria-labelledby="login-title">
      <div className="mb-5 text-center">
        <h1
          id="login-title"
          className="mb-2 text-[25px] font-medium leading-tight text-[#171717]"
        >
          Log in
        </h1>
        <p className="text-[14px] text-[#777]">Welcome back to PulseAI.</p>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-[14px] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={onChange}
          required
        />

        <label className="sr-only" htmlFor="login-password">
          Password
        </label>
        <input
          id="login-password"
          className="h-11 w-full rounded-xl border border-transparent bg-[#f4f4f4] px-3.5 text-[14px] text-[#171717] outline-none transition placeholder:text-[#aaa] focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#a78bfa]/20"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={onChange}
          required
        />
        <div className="text-right">
          <Link
            className="text-[13px] font-medium text-[#555] underline underline-offset-2 hover:text-black"
            to="/forgot-password"
          >
            Forgot your password?
          </Link>
        </div>

        {error && (
          <p className="text-left text-[13px] text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          className="h-11 w-full rounded-xl bg-black px-4 text-[14px] font-medium text-white transition hover:bg-[#292929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[#e7e7e7]" />
        <span className="text-[12px] text-[#666]">or</span>
        <span className="h-px flex-1 bg-[#e7e7e7]" />
      </div>

      <div className="space-y-2.5">
        <button
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 text-[14px] text-[#171717] transition hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] disabled:cursor-wait disabled:opacity-60"
          type="button"
          onClick={onGoogleLogin}
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
          <span>{isGoogleSubmitting ? "Logging in..." : "Log in with Google"}</span>
        </button>
      </div>

      <p className="mt-5 text-center text-[13px] text-[#777]">
        New to PulseAI?{" "}
        <Link className="font-medium text-[#171717] underline" to="/signup">
          Sign up
        </Link>
      </p>
    </section>
  );
}

export default LoginCard;
