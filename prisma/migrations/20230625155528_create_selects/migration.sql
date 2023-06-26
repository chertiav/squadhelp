-- CreateTable
CREATE TABLE "selects" (
    "type" TEXT NOT NULL,
    "describe" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "selects_pkey" PRIMARY KEY ("type","describe")
);
