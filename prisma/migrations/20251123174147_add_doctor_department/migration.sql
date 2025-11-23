/*
  Warnings:

  - The `user_type` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `role` on the `hospital_users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `invitations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'PATIENT', 'STAFF');

-- AlterTable
ALTER TABLE "doctor_profiles" ADD COLUMN     "department" TEXT;

-- AlterTable
ALTER TABLE "hospital_users" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_type",
ADD COLUMN     "user_type" "UserRole" NOT NULL DEFAULT 'PATIENT';

-- DropEnum
DROP TYPE "UserType";
