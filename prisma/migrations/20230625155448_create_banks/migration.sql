-- CreateTable
CREATE TABLE "banks" (
    "card_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expiry" TEXT NOT NULL,
    "cvc" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("card_number")
);
