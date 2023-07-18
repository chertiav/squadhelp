-- CreateEnum
CREATE TYPE "ContestType" AS ENUM ('name', 'tagline', 'logo');

-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('pending', 'active', 'finished');

-- CreateEnum
CREATE TYPE "TypeOfName" AS ENUM ('Company', 'Product', 'Project');

-- CreateEnum
CREATE TYPE "StyleName" AS ENUM ('Classic', 'Fun', 'Professional', 'Descriptive', 'Youthful', 'Any');

-- CreateEnum
CREATE TYPE "TypeOfTagline" AS ENUM ('Classic', 'Fun', 'Powerful', 'Descriptive', 'Modern', 'Any');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('Creative Agency', 'Consulting Firm', 'Skin care', 'Biotech', 'Publisher', 'Education', 'Footwear', 'Medical', 'Builders');

-- CreateEnum
CREATE TYPE "BrandStyle" AS ENUM ('Tech', 'Fun', 'Fancy', 'Minimal', 'Brick & Mortar', 'Photo-based');

-- CreateTable
CREATE TABLE "contests" (
    "id" SERIAL NOT NULL,
    "contest_type" "ContestType" NOT NULL,
    "file_name" TEXT,
    "original_file_name" TEXT,
    "title" TEXT,
    "type_of_name" "TypeOfName",
    "industry" "Industry",
    "focus_of_work" TEXT,
    "target_customer" TEXT,
    "style_name" "StyleName",
    "name_venture" TEXT,
    "type_of_tagline" "TypeOfTagline",
    "status" "ContestStatus" NOT NULL DEFAULT 'pending',
    "brand_style" "BrandStyle",
    "price" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
