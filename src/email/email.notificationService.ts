// For user-facing notifications
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./email.service";

const prisma = new PrismaClient();

export async function sendNotification(
  userId: string,
  email: string,
  type: string,
  subject: string,
  html: string
) {
  // 1. Create a PENDING record
  const notification = await prisma.notification.create({
    data: { userId, email, type, subject, status: "PENDING" },
  });

  try {
    // 2. Send the email
    await sendEmail({ to: email, subject, html });

    // 3. Mark as SENT
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (error) {
    // 4. Mark as FAILED for retry/debugging
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}