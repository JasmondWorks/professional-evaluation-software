-- CreateTable
CREATE TABLE "supervision_cost" (
    "id" SERIAL NOT NULL,
    "org" TEXT NOT NULL,
    "a_ij" DECIMAL(10,4),
    "a_cost" DECIMAL(12,4),
    "b_cost" DECIMAL(12,4),
    "lambda" DECIMAL(10,6),
    "mu" DECIMAL(10,6),
    "rho" DECIMAL(10,6),
    "p0" DECIMAL(10,6),
    "lbar" DECIMAL(10,6),
    "kmin" INTEGER,
    "kmax" INTEGER,
    "kstar" INTEGER,
    "dstar" DECIMAL(12,6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supervision_cost_pkey" PRIMARY KEY ("id")
);
