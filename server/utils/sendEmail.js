/**
 * Resend Email Service
 * 
 * Production email delivery using Resend (https://resend.com)
 * 
 * Setup:
 * 1. Create account at https://resend.com
 * 2. Add and verify your domain (or use resend.dev for testing)
 * 3. Create an API key
 * 4. Set RESEND_API_KEY and EMAIL_FROM in .env
 *
 * EMAIL_FROM format: "Kanha Collection <noreply@yourdomain.com>"
 * For testing without a domain: "onboarding@resend.dev"
 */

const { Resend } = require('resend');

let resendClient = null;

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured in .env');
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

/**
 * Send an email using Resend
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || 'Kanha Collection <onboarding@resend.dev>';
  const client = getResendClient();

  const { data, error } = await client.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    console.error('[Resend Error]', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};

module.exports = sendEmail;
