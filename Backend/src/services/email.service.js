import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
});

export const verifyMailer = async () => {
    try {
        await transporter.verify();
        console.log("Mailer: connected");
    } catch (error) {
        console.error(`Mailer: unavailable (${error.message})`);
    }
};

// Email layout
const layout = (body) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #0f0f1a;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #e2e8f0;
    }

    .wrap {
      max-width: 520px;
      margin: 32px auto;
      padding: 0 16px;
    }

    .card {
      background: #16162a;
      border-radius: 16px;
      border: 1px solid #2d1b69;
      overflow: hidden;
    }

    .head {
      background: linear-gradient(135deg, #4c1d95, #1e3a8a);
      padding: 28px 24px;
      text-align: center;
    }

    .head h1 {
      font-size: 20px;
      color: #fff;
      margin-top: 8px;
    }

    .head p {
      font-size: 13px;
      color: #c4b5fd;
      margin-top: 4px;
    }

    .body {
      padding: 28px 24px;
    }

    .body p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.7;
      margin-bottom: 14px;
    }

    .otp {
      background: #0a0a16;
      border: 1px solid #2d2d50;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      font-size: 34px;
      font-weight: 700;
      letter-spacing: 10px;
      color: #a78bfa;
      margin: 16px 0;
    }

    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #7c3aed, #2563eb);
      color: #fff;
      text-decoration: none;
      padding: 13px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      margin: 8px 0 16px;
    }

    .note {
      font-size: 12px;
      color: #4a4a6a;
      margin-top: 8px;
    }

    .foot {
      padding: 16px 24px;
      text-align: center;
      font-size: 12px;
      color: #4a4a6a;
      border-top: 1px solid #2d2d50;
    }
  </style>

</head>

<body>

  <div class="wrap">

    <div class="card">

      <div class="head">
        <div style="font-size:36px">✨</div>

        <h1>AstroAsk App</h1>

        <p>Your cosmic guide</p>
      </div>

      <div class="body">
        ${body}
      </div>

      <div class="foot">
        © ${new Date().getFullYear()} AstroAsk App · Do not reply to this email
      </div>

    </div>

  </div>

</body>

</html>
`;

// Generic send function
const send = (to, subject, body) => {
    return transporter.sendMail({
        from: config.EMAIL_FROM,
        to,
        subject,
        html: layout(body),
    });
};

// Verify Account OTP
export const sendVerificationOTP = (user, otp) => {
    return send(
        user.email,
        "Verify your AstroAsk account — OTP",

        `
        <p>
          Hi <strong style="color:#e2e8f0">
            ${user.name}
          </strong>,
        </p>

        <p>
          Use the OTP below to verify your account.
          It expires in
          <strong style="color:#a78bfa">
            10 minutes
          </strong>.
        </p>

        <div class="otp">
          ${otp}
        </div>

        <p class="note">
          If you didn't create an account, ignore this email.
        </p>
        `
    );
};

// Password Reset OTP
export const sendPasswordResetOTP = (user, otp) => {
    return send(
        user.email,
        "Password reset OTP — Jyotish App",

        `
        <p>
          Hi <strong style="color:#e2e8f0">
            ${user.name}
          </strong>,
        </p>

        <p>
          Use the OTP below to reset your password.
          It expires in
          <strong style="color:#f87171">
            15 minutes
          </strong>.
        </p>

        <div class="otp">
          ${otp}
        </div>

        <p class="note">
          If you didn't request this, secure your account immediately.
        </p>
        `
    );
};

// Welcome Email
export const sendWelcome = (user) => {
    return send(
        user.email,
        "Welcome to AstroAsk App 🎉",

        `
        <p>
          Hi <strong style="color:#e2e8f0">
            ${user.name}
          </strong>,
        </p>

        <p>
          Your account is verified.
          Explore everything AstroAsk App has to offer:
        </p>

        <ul
          style="
            color:#94a3b8;
            padding-left:20px;
            line-height:2;
            font-size:14px;
            margin-bottom:16px;
          "
        >
          <li>🌟 Generate your Kundli</li>
          <li>🔮 Palm reading with AI</li>
          <li>♈ Daily horoscope</li>
          <li>🤖 Ask the AI astrologer</li>
        </ul>

        <a
          href="${process.env.FRONTEND_URL}/dashboard"
          class="btn"
        >
          Open Dashboard →
        </a>
        `
    );
};

// Password Changed Email
export const sendPasswordChanged = (user) => {
    return send(
        user.email,
        "Your password was changed AstroAsk App",

        `
        <p>
          Hi <strong style="color:#e2e8f0">
            ${user.name}
          </strong>,
        </p>

        <p>
          Your password was successfully changed.
        </p>

        <p class="note">
          If this wasn't you, contact support immediately.
        </p>
        `
    );
};