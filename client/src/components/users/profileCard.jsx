function ProfileCard({
  profile,
  isLoading,
  error,
  passwordForm,
  passwordNotice,
  onPasswordChange,
  onPasswordSubmit,
}) {
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[760px] py-8 text-center text-[14px] text-[#777]">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="mx-auto w-full max-w-[760px] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700"
        role="alert"
      >
        {error}
      </div>
    );
  }

  const initials = (profile?.name || "U")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[760px] text-left">
      <div className="mb-8 flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#3498d4] text-xl font-medium text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="m-0 truncate text-[26px] font-semibold text-[#171717]">
            Profile
          </h1>
          <p className="mt-1 text-[14px] text-[#777]">
            Manage your account details.
          </p>
        </div>
      </div>

      <section
        className="border-t border-[#e8e8e8] py-6"
        aria-labelledby="personal-heading"
      >
        <h2
          id="personal-heading"
          className="mb-5 text-[17px] font-semibold text-[#222]"
        >
          Personal information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#444]">
            Name
            <input
              className="h-11 rounded-lg border border-[#dedede] bg-white px-3 text-[14px] font-normal text-[#222] outline-none"
              value={profile?.name || ""}
              readOnly
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#444]">
            Email
            <input
              className="h-11 rounded-lg border border-[#dedede] bg-[#f7f7f7] px-3 text-[14px] font-normal text-[#666] outline-none"
              type="email"
              value={profile?.email || ""}
              readOnly
            />
          </label>
        </div>
      </section>

      <section
        id="settings"
        className="border-t border-[#e8e8e8] py-6"
        aria-labelledby="password-heading"
      >
        <h2
          id="password-heading"
          className="mb-1 text-[17px] font-semibold text-[#222]"
        >
          Update password
        </h2>
        <p className="mb-5 text-[13px] text-[#777]">
          Password changes require a server endpoint that is not available yet.
        </p>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onPasswordSubmit}>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#444]">
            Current password
            <input
              className="h-11 rounded-lg border border-[#dedede] bg-white px-3 text-[14px] font-normal text-[#222] outline-none focus:border-[#888]"
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={onPasswordChange}
            />
          </label>
          <div className="hidden sm:block" />
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#444]">
            New password
            <input
              className="h-11 rounded-lg border border-[#dedede] bg-white px-3 text-[14px] font-normal text-[#222] outline-none focus:border-[#888]"
              type="password"
              name="newPassword"
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={onPasswordChange}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#444]">
            Confirm new password
            <input
              className="h-11 rounded-lg border border-[#dedede] bg-white px-3 text-[14px] font-normal text-[#222] outline-none focus:border-[#888]"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={onPasswordChange}
            />
          </label>
          {passwordNotice && (
            <p className="text-[13px] text-[#777] sm:col-span-2" role="status">
              {passwordNotice}
            </p>
          )}
          <button
            className="h-10 w-fit rounded-lg bg-[#171717] px-4 text-[13px] font-medium text-white transition hover:bg-[#333] sm:col-span-2"
            type="submit"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}

export default ProfileCard;
