import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: parseInt(process.env.MAIL_PORT || '587', 10) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const FROM = process.env.MAIL_FROM || '"Canada Immigration" <noreply@immigration.ca>';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';

export async function sendVerificationEmail(
  email: string,
  token: string,
  userType: 'client' | 'admin' = 'client',
) {
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: '✅ Verify Your Email - Canada Immigration Services',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:20px;text-align:center;border-radius:8px 8px 0 0">
          🍁 Canada Immigration Services
        </h1>
        <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px">
          <h2>Please verify your email</h2>
          <p>Click the button below to verify your ${userType} account:</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${verificationLink}" style="background:#667eea;color:#fff;padding:12px 30px;text-decoration:none;border-radius:5px">
              Verify Email Address
            </a>
          </div>
          <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
          <p><strong>This link expires in 24 hours.</strong></p>
        </div>
      </div>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
) {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: '🔐 Password Reset - Canada Immigration Services',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="background:linear-gradient(135deg,#f093fb,#f5576c);color:#fff;padding:20px;text-align:center;border-radius:8px 8px 0 0">
          🔐 Password Reset Request
        </h1>
        <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px">
          <h2>Reset Your Password</h2>
          <p>Click the button below to reset your password:</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${resetLink}" style="background:#f5576c;color:#fff;padding:12px 30px;text-decoration:none;border-radius:5px">
              Reset Password
            </a>
          </div>
          <p>Or copy this link: <a href="${resetLink}">${resetLink}</a></p>
          <p><strong>This link expires in 1 hour.</strong></p>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      </div>`,
  });
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  await transporter.sendMail({ from: FROM, ...opts });
}
