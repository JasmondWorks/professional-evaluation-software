-- CreateTable
CREATE TABLE "WorkSamplingStudy" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255),
    "department" VARCHAR(255),
    "analyst" VARCHAR(255),
    "authorizedBy" VARCHAR(255),
    "confidenceLevel" INTEGER,
    "desiredAccuracy" DOUBLE PRECISION,
    "preliminaryP" DOUBLE PRECISION,
    "totalObservationsRequired" INTEGER,
    "studyMonth" INTEGER,
    "observationsPerDay" INTEGER,
    "workingHoursPerDay" DOUBLE PRECISION,
    "workStartTime" VARCHAR(10),
    "minCycleDuration" DOUBLE PRECISION,
    "maxDuration" DOUBLE PRECISION,
    "estimatedStudyDays" INTEGER,
    "availableAnnualHours" DOUBLE PRECISION,
    "defaultPerformanceAllowance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkSamplingStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSamplingPosition" (
    "id" SERIAL NOT NULL,
    "studyId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "department" VARCHAR(255),
    "performanceAllowance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkSamplingPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSamplingObservation" (
    "id" SERIAL NOT NULL,
    "positionId" INTEGER NOT NULL,
    "date" VARCHAR(20) NOT NULL,
    "time" VARCHAR(10) NOT NULL,
    "isBusy" BOOLEAN NOT NULL,
    "performanceRating" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkSamplingObservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkSamplingPosition" ADD CONSTRAINT "WorkSamplingPosition_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "WorkSamplingStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSamplingObservation" ADD CONSTRAINT "WorkSamplingObservation_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "WorkSamplingPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
