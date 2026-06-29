-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "responsiblePrimary" TEXT NOT NULL DEFAULT 'Coordenação Administrativa',
    "responsibleSecondary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "bscPerspective" TEXT NOT NULL,
    "strategicObjective" TEXT NOT NULL,
    "linkedProject" TEXT,
    "organizationalGoal" TEXT,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "polarity" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "collectionFrequency" TEXT NOT NULL DEFAULT 'MENSAL',
    "analysisFrequency" TEXT NOT NULL DEFAULT 'MENSAL',
    "purpose" TEXT NOT NULL,
    "operationalDefinition" TEXT NOT NULL,
    "relevance" TEXT,
    "limitations" TEXT,
    "formula" TEXT NOT NULL,
    "numerator" TEXT,
    "denominator" TEXT,
    "inclusionCriteria" TEXT,
    "exclusionCriteria" TEXT,
    "sourceSystem" TEXT NOT NULL,
    "storageLocation" TEXT,
    "collectionMethod" TEXT NOT NULL,
    "collectionOwner" TEXT NOT NULL DEFAULT 'Coordenação Administrativa',
    "evidence" TEXT,
    "isAiEligible" BOOLEAN NOT NULL DEFAULT false,
    "isAiIntegrable" BOOLEAN NOT NULL DEFAULT false,
    "dashboardName" TEXT,
    "aiAgentName" TEXT,
    "dataReliability" TEXT NOT NULL DEFAULT 'Médio',
    "requiresAudit" BOOLEAN NOT NULL DEFAULT true,
    "auditFrequency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "month" INTEGER,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "alertValue" DOUBLE PRECISION,
    "minimumValue" DOUBLE PRECISION,
    "idealValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "referenceDate" TIMESTAMP(3) NOT NULL,
    "actualValue" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "achievement" DOUBLE PRECISION NOT NULL,
    "trafficLight" TEXT NOT NULL,
    "analysis" TEXT,
    "actionPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Okr" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Okr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OkrIndicator" (
    "id" TEXT NOT NULL,
    "okrId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "OkrIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_code_key" ON "Indicator"("code");

-- CreateIndex
CREATE INDEX "Goal_indicatorId_year_quarter_month_idx" ON "Goal"("indicatorId", "year", "quarter", "month");

-- CreateIndex
CREATE INDEX "Result_indicatorId_referenceDate_idx" ON "Result"("indicatorId", "referenceDate");

-- CreateIndex
CREATE UNIQUE INDEX "OkrIndicator_okrId_indicatorId_key" ON "OkrIndicator"("okrId", "indicatorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_createdAt_idx" ON "AuditLog"("entity", "entityId", "createdAt");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OkrIndicator" ADD CONSTRAINT "OkrIndicator_okrId_fkey" FOREIGN KEY ("okrId") REFERENCES "Okr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OkrIndicator" ADD CONSTRAINT "OkrIndicator_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
