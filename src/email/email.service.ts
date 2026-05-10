// This file is for handling sending logic
import { transporter } from "../email/email.mailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  await transporter.sendMail({
    from: `"My App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}