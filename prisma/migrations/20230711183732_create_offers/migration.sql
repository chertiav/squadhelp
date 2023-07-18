-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('pending', 'active', 'rejected', 'won');

-- CreateTable
CREATE TABLE "offers" (
    "id" SERIAL NOT NULL,
    "text" TEXT,
    "file_name" TEXT,
    "original_file_name" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'pending',
    "user_id" INTEGER NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
