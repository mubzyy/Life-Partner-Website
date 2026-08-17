const nodemailer = require("nodemailer");

/**
 * Email service layer — Nodemailer/SMTP, configured entirely via environment
 * variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM). This is
 * the single place any route sends email from; nothing else in the app
 * touches nodemailer or SMTP directly.
 *
 * Replaces the previous Resend-based implementation. The exported function
 * signature (sendOtpEmail(to, otp, purpose)) and the HTML it sends are
 * unchanged, so every caller (server/routes/auth.js) needed zero changes.
 */

const REQUIRED_VARS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];

// The transporter is created lazily (on first send) and cached — not at
// module load — so a server without SMTP configured can still boot and
// serve every other route. Only the first attempt to actually send an email
// pays the cost of discovering the misconfiguration, and it fails with a
// clear, specific message instead of a generic crash or a silent no-op.
let cachedTransporter = null;

function getTransporter() {
    const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
    if (missing.length > 0) {
        throw new Error(
            `Email service is not configured: missing environment variable(s) ${missing.join(", ")}. ` +
            `Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM before sending email.`
        );
    }

    if (cachedTransporter) return cachedTransporter;

    const port = Number(process.env.SMTP_PORT);
    cachedTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        // 465 is implicit TLS; every other port (587, 25, ...) negotiates
        // STARTTLS instead — this matches how every mainstream SMTP provider
        // (Gmail, Outlook, Zoho, Mailtrap) expects to be dialed.
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    return cachedTransporter;
}

/**
 * Send a beautifully styled OTP email
 * @param {string} to - Recipient email address
 * @param {string} otp - The 6-digit OTP code
 * @param {string} purpose - "verification" | "reset"
 */
const sendOtpEmail = async (to, otp, purpose = "verification") => {
  const isReset = purpose === "reset";

  const subject = isReset
    ? "Reset Your Life Partner Password"
    : "Verify Your Life Partner Account";

  const heading = isReset ? "Password Reset Request" : "Email Verification";

  const message = isReset
    ? "We received a request to reset your password. Use the code below to proceed. This code is valid for <strong>10 minutes</strong>."
    : "Thank you for joining Life Partner. Use the code below to verify your email address. This code is valid for <strong>10 minutes</strong>.";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0f5d52,#1a7a6e);padding:36px 40px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;">Life Partner</h1>
                  <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">Find your partner for life</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <h2 style="color:#1a2e2b;font-size:20px;font-weight:700;margin:0 0 12px;">${heading}</h2>
                  <p style="color:#6b8a86;font-size:15px;line-height:1.6;margin:0 0 28px;">${message}</p>

                  <!-- OTP Box -->
                  <div style="background:#f0f7f5;border:2px dashed #0f5d52;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                    <p style="color:#52706c;font-size:13px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
                    <p style="color:#0f5d52;font-size:42px;font-weight:800;letter-spacing:12px;margin:0;font-family:'Courier New',monospace;">${otp}</p>
                  </div>

                  <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0;">
                    If you did not request this, you can safely ignore this email. Do not share this code with anyone.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e8edf0;text-align:center;">
                  <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Life Partner. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });

  console.log("Email sent successfully via SMTP. Message ID:", info.messageId);
};

module.exports = { sendOtpEmail };
