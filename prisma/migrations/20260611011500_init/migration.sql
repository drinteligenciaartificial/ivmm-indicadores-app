-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicatorId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "month" INTEGER,
    "targetValue" REAL NOT NULL,
    "alertValue" REAL,
    "minimumValue" REAL,
    "idealValue" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "indicatorId" TEXT NOT NULL,
    "referenceDate" DATETIME NOT NULL,
    "actualValue" REAL NOT NULL,
    "targetValue" REAL NOT NULL,
    "achievement" REAL NOT NULL,
    "trafficLight" TEXT NOT NULL,
    "analysis" TEXT,
    "actionPlan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Result_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Okr" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "owner" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OkrIndicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "okrId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1,
    CONSTRAINT "OkrIndicator_okrId_fkey" FOREIGN KEY ("okrId") REFERENCES "Okr" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OkrIndicator_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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

