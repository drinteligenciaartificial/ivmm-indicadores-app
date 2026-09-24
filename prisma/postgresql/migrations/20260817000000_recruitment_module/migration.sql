-- CreateTable
CREATE TABLE "RecruitmentPosition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "managerName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "mission" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "hardSkills" TEXT NOT NULL,
    "softSkills" TEXT NOT NULL,
    "tools" TEXT,
    "education" TEXT,
    "experience" TEXT,
    "behavioralProfile" TEXT,
    "culturalValues" TEXT NOT NULL,
    "eliminatoryCriteria" TEXT,
    "desirableCriteria" TEXT,
    "remunerationRange" TEXT,
    "workModel" TEXT,
    "schedule" TEXT,
    "competencyWeights" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentVacancy" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "openings" INTEGER NOT NULL DEFAULT 1,
    "managerName" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentVacancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentCandidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "stage" TEXT NOT NULL DEFAULT 'INSCRICAO',
    "vacancyId" TEXT,
    "positionId" TEXT,
    "resumeText" TEXT,
    "professionalSummary" TEXT,
    "curriculumScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "iacScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ipdScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qualityOfHireScore" DOUBLE PRECISION,
    "decision" TEXT,
    "decisionJustification" TEXT,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentStageHistory" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "notes" TEXT,
    "actorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitmentStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentEvaluation" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "evaluatorName" TEXT NOT NULL,
    "competency" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evidence" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentAssessment" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,
    "evaluatorName" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evidence" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentAiAnalysis" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "contextUsed" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "humanFeedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE_AVALIACAO_HUMANA',
    "requestedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitmentAiAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentPosition_code_key" ON "RecruitmentPosition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentVacancy_code_key" ON "RecruitmentVacancy"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentCandidate_email_key" ON "RecruitmentCandidate"("email");

-- CreateIndex
CREATE INDEX "RecruitmentCandidate_stage_status_idx" ON "RecruitmentCandidate"("stage", "status");

-- CreateIndex
CREATE INDEX "RecruitmentCandidate_vacancyId_idx" ON "RecruitmentCandidate"("vacancyId");

-- CreateIndex
CREATE INDEX "RecruitmentStageHistory_candidateId_createdAt_idx" ON "RecruitmentStageHistory"("candidateId", "createdAt");

-- CreateIndex
CREATE INDEX "RecruitmentEvaluation_candidateId_type_idx" ON "RecruitmentEvaluation"("candidateId", "type");

-- CreateIndex
CREATE INDEX "RecruitmentAssessment_candidateId_idx" ON "RecruitmentAssessment"("candidateId");

-- CreateIndex
CREATE INDEX "RecruitmentAiAnalysis_candidateId_analysisType_idx" ON "RecruitmentAiAnalysis"("candidateId", "analysisType");

-- AddForeignKey
ALTER TABLE "RecruitmentVacancy" ADD CONSTRAINT "RecruitmentVacancy_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "RecruitmentPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentCandidate" ADD CONSTRAINT "RecruitmentCandidate_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "RecruitmentVacancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentCandidate" ADD CONSTRAINT "RecruitmentCandidate_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "RecruitmentPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentStageHistory" ADD CONSTRAINT "RecruitmentStageHistory_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "RecruitmentCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentEvaluation" ADD CONSTRAINT "RecruitmentEvaluation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "RecruitmentCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentAssessment" ADD CONSTRAINT "RecruitmentAssessment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "RecruitmentCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentAiAnalysis" ADD CONSTRAINT "RecruitmentAiAnalysis_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "RecruitmentCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
