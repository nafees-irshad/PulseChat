function SignupCard({
  form,
  error,
  success,
  isSubmitting,
  onChange,
  onSubmit,
}) {
  return (
    <section className="w-full max-w-[360px]" aria-labelledby="signup-title">
      <div className="mb-5 text-center">
        <h1
          id="signup-title"
          className="mb-2 text-[25px] font-medium leading-tight text-[#171717]"
        >
          Create your account
        </h1>
        <p className="text-[14px] text-[#777]">
          Sign up to get started with Espresso AI.
        </p>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
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
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
        />

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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[#e7e7e7]" />
        <span className="text-[12px] text-[#666]">or</span>
        <span className="h-px flex-1 bg-[#e7e7e7]" />
      </div>

      <div className="space-y-2.5">
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 text-[14px] text-[#171717] transition hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-[18px] w-[18px]"
            viewBox="0 0 48 48"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
              transform="translate(0 5)"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.94c4.46-4.12 7.16-10.2 7.16-17.59Z"
              transform="translate(0 1)"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
              transform="translate(0 5)"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.65-5.94c-2.13 1.43-4.86 2.3-8.25 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
              transform="translate(0 -5)"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 text-[14px] text-[#171717] transition hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-[18px] w-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          >
            <path d="M7.5 3.5h2.2l1.1 4.1-1.7 1.7a14.1 14.1 0 0 0 5.6 5.6l1.7-1.7 4.1 1.1v2.2a2 2 0 0 1-2.2 2A16.3 16.3 0 0 1 5.5 5.7a2 2 0 0 1 2-2.2Z" />
          </svg>
          <span>Sign up with phone</span>
        </button>
      </div>
    </section>
  );
}

export default SignupCard;
