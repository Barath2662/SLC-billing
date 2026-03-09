-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" SERIAL NOT NULL,
    "bill_number" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "travel_details" TEXT,
    "gstin" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicle_number" TEXT,
    "trip_date" TIMESTAMP(3),
    "starting_time" TEXT,
    "closing_time" TEXT,
    "total_hours" DECIMAL(10,2),
    "starting_kms" DECIMAL(10,2),
    "closing_kms" DECIMAL(10,2),
    "total_kms" DECIMAL(10,2),
    "charge_per_km" DECIMAL(10,2),
    "charge_per_day" DECIMAL(10,2),
    "fuel_charges" DECIMAL(10,2),
    "local_trip_charges" DECIMAL(10,2),
    "free_kms" DECIMAL(10,2),
    "chargeable_kms" DECIMAL(10,2),
    "waiting_charges" DECIMAL(10,2),
    "night_halt_charges" DECIMAL(10,2),
    "driver_bata" DECIMAL(10,2),
    "permit_charges" DECIMAL(10,2),
    "other_expenses" DECIMAL(10,2),
    "total_amount" DECIMAL(12,2) NOT NULL,
    "rupees_in_words" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bills_bill_number_key" ON "bills"("bill_number");
