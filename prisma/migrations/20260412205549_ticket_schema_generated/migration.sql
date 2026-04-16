/*
  Warnings:

  - You are about to drop the column `assignedToID` on the `Ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_assignedToID_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "assignedToID",
ADD COLUMN     "assignedToId" TEXT;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
