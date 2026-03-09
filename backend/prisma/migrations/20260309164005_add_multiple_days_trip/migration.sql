-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "multiple_days" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trip_end_date" TIMESTAMP(3);
