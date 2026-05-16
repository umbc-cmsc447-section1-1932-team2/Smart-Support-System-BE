// For user-facing notifications
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./email/email.service";

const prisma = new PrismaClient();

export async function sendNotification(
  userId: string,
  email: string,
  type: string,
  subject: string,
  html: string
) {
  // Create a PENDING record
  const notification = await prisma.notification.create({
    data: { userId, email, type, subject, status: "PENDING" },
  });

  try {
    // Send the email
    await sendEmail({ to: email, subject, html });

    // Mark email corr to notification as SENT
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (error) {
    // Mark as FAILED for retry/debugging
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}
