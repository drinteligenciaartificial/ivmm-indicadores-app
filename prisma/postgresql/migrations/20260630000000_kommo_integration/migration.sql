-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DESCONECTADO',
    "subdomain" TEXT,
    "accountId" TEXT,
    "accountName" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalCrmRecord" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT,
    "pipelineId" TEXT,
    "statusId" TEXT,
    "responsibleUserId" TEXT,
    "monetaryValue" DOUBLE PRECISION,
    "sourceCreatedAt" TIMESTAMP(3),
    "sourceUpdatedAt" TIMESTAMP(3),
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExternalCrmRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSync" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    CONSTRAINT "IntegrationSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_provider_key" ON "IntegrationConnection"("provider");
CREATE UNIQUE INDEX "ExternalCrmRecord_integrationId_entityType_externalId_key" ON "ExternalCrmRecord"("integrationId", "entityType", "externalId");
CREATE INDEX "ExternalCrmRecord_integrationId_entityType_sourceUpdatedAt_idx" ON "ExternalCrmRecord"("integrationId", "entityType", "sourceUpdatedAt");
CREATE INDEX "IntegrationSync_integrationId_startedAt_idx" ON "IntegrationSync"("integrationId", "startedAt");

-- AddForeignKey
ALTER TABLE "ExternalCrmRecord" ADD CONSTRAINT "ExternalCrmRecord_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationSync" ADD CONSTRAINT "IntegrationSync_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
