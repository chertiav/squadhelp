-- CreateTable
CREATE TABLE "ratings" (
    "offer_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "mark" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("offer_id","user_id")
);

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
