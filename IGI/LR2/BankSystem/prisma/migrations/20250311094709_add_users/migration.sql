-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'OPERATOR', 'MANAGER', 'ADMIN', 'ENTERPISE_SPECIALIST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
