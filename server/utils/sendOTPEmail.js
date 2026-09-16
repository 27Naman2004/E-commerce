const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass || emailUser === 'your_email@gmail.com' || emailPass === 'your_google_app_password') {
    const error = new Error('Gmail SMTP is not configured. Set EMAIL_USER to your Gmail address and EMAIL_PASS to a Google App Password in server/.env.');
    error.code = 'EMAIL_CONFIG_MISSING';
    throw error;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return transporter;
};

const buildOTPEmailHTML = ({ otp, websiteName, expiryMinutes }) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your ${websiteName} OTP</title>
  </head>
  <body style="margin:0;background:#fff4f7;font-family:Arial,Helvetica,sans-serif;color:#35232a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff4f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #f8dde5;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#8e2948;padding:28px 32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.3;">${websiteName}</h1>
                <p style="margin:8px 0 0;color:#ffe9f0;font-size:14px;">Secure email verification</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 12px;font-size:20px;color:#35232a;">Your one-time password</h2>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#806b73;">
                  Use this 6-digit OTP to complete your sign-in. It expires in <strong>${expiryMinutes} minutes</strong>.
                </p>
                <div style="background:#fff4f7;border:2px dashed #c94f73;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                  <p style="margin:0;font-family:Courier New,monospace;font-size:42px;font-weight:700;letter-spacing:10px;color:#8e2948;">${otp}</p>
                </div>
                <p style="margin:0;padding:14px 16px;background:#fff9f2;border:1px solid #f0d7ad;border-radius:10px;font-size:13px;line-height:1.6;color:#6d5961;">
                  Security warning: never share this OTP with anyone. ${websiteName} will never ask for your OTP by phone, chat, or email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;text-align:center;background:#fff4f7;color:#806b73;font-size:12px;">
                If you did not request this code, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const sendOTPEmail = async ({ to, otp }) => {
  const websiteName = process.env.WEBSITE_NAME || 'Kanha Collection';
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 5);
  const from = process.env.EMAIL_FROM || `"${websiteName}" <${process.env.EMAIL_USER}>`;

  return getTransporter().sendMail({
    from,
    to,
    subject: `${otp} is your ${websiteName} verification code`,
    html: buildOTPEmailHTML({ otp, websiteName, expiryMinutes }),
  });
};

module.exports = sendOTPEmail;
