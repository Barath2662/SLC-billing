/*
  Warnings:

  - You are about to drop the column `chargeable_kms` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `free_kms` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `fuel_charges` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `local_trip_charges` on the `bills` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bills" DROP COLUMN "chargeable_kms",
DROP COLUMN "free_kms",
DROP COLUMN "fuel_charges",
DROP COLUMN "local_trip_charges",
ADD COLUMN     "toll_charges" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_name_key" ON "customers"("name");
