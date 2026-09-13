/**
 * Branded HTML OTP Email Template — Kanha Collection
 * Pink / Rose / Cream aesthetic matching the website theme.
 */

const getOtpEmailTemplate = ({ otp, type = 'email' }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Your OTP — Kanha Collection</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF4F7;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Outer Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF4F7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(201,79,115,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#8E2948 0%,#C94F73 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;">🪷</p>
              <h1 style="margin:8px 0 4px;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">
                Kanha Collection
              </h1>
              <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                Premium Devotional Store
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#35232A;font-weight:600;">
                Your One-Time Password
              </h2>
              <p style="margin:0 0 28px;font-size:15px;color:#806B73;line-height:1.6;">
                Use the following OTP to complete your sign-in to Kanha Collection.
                This code is valid for <strong style="color:#8E2948;">5 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#FFF4F7;border:2px dashed #F8DDE5;border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 8px;font-size:12px;color:#806B73;letter-spacing:2px;text-transform:uppercase;">
                  Your OTP Code
                </p>
                <p style="margin:0;font-size:48px;font-weight:700;color:#8E2948;letter-spacing:12px;font-family:monospace;">
                  ${otp}
                </p>
              </div>

              <!-- Security Note -->
              <table width="100%" style="background:#FFF9F2;border-radius:12px;padding:0;border:1px solid #F8DDE5;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#806B73;line-height:1.6;">
                      🔒 <strong style="color:#35232A;">Security Notice:</strong>
                      Kanha Collection will <strong>never</strong> call you or ask for this OTP.
                      Do not share this code with anyone.
                      If you did not request this, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FFF4F7;padding:20px 40px;text-align:center;border-top:1px solid #F8DDE5;">
              <p style="margin:0;font-size:12px;color:#806B73;">
                © ${new Date().getFullYear()} Kanha Collection · All rights reserved
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#C99A3D;font-weight:600;">
                Crafted with 🙏 and devotion
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

module.exports = { getOtpEmailTemplate };
