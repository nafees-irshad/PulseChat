export function generateOtpEmailHtml(otp) {
  return `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Your PulseChat verification code</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#171717;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
            Your PulseChat verification code is ${otp}. It expires in 10 minutes.
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f4f7;padding:40px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e8e7ee;border-radius:16px;">
                  <tr>
                    <td style="padding:32px 36px 28px;">
                      <p style="margin:0 0 28px;font-size:18px;font-weight:700;letter-spacing:-0.4px;color:#171717;">
                        <span style="display:inline-block;width:10px;height:10px;margin-right:8px;border-radius:50%;background-color:#8b5cf6;vertical-align:1px;"></span>PulseChat
                      </p>
                      <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#8b5cf6;">
                        Email verification
                      </p>
                      <h1 style="margin:0 0 12px;font-size:25px;line-height:1.3;font-weight:700;letter-spacing:-0.5px;color:#171717;">
                        Confirm it’s you
                      </h1>
                      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#666670;">
                        Enter this one-time code to finish creating your PulseChat account.
                      </p>
                      <div style="margin:0 0 20px;padding:20px 12px;border:1px solid #e9e3ff;border-radius:12px;background-color:#f8f6ff;text-align:center;">
                        <span style="font-size:32px;line-height:1.2;font-weight:700;letter-spacing:8px;color:#171717;">${otp}</span>
                      </div>
                      <p style="margin:0 0 28px;font-size:13px;line-height:1.6;color:#777780;">
                        This code expires in <strong style="color:#44444d;">10 minutes</strong>. For your security, don’t share it with anyone.
                      </p>
                      <div style="height:1px;background-color:#eeeeF2;"></div>
                      <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#92929b;">
                        If you didn’t request this code, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;font-size:11px;line-height:1.5;color:#a0a0a8;">
                  PulseChat · Your space for thoughtful conversations
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
}