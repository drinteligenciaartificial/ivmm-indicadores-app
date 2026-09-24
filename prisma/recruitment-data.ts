import type { PrismaClient } from "@prisma/client";

type Actor = { name: string; role: string };

const weights = {
  "Comunicação acolhedora": 15,
  "Organização e atenção a detalhes": 14,
  "Domínio de sistemas": 12,
  "Postura ética": 15,
  "Resolução de problemas": 12,
  "Inteligência emocional": 14,
  "Cultura IVMM": 15,
  "Aprendizagem": 10,
};

const candidates = [
  {
    name: "Marina Alves",
    email: "marina.alves.demo@ivmm.local",
    phone: "(82) 90000-1001",
    source: "Banco de Talentos",
    stage: "ASSESSMENT",
    curriculumScore: 86,
    iacScore: 91,
    ipdScore: 84,
    sceScore: 88,
    tags: "recepção, crm, atendimento humanizado",
    summary: "Experiência em recepção clínica, WhatsApp comercial, organização de agenda e registro de leads em CRM.",
  },
  {
    name: "Paula Nascimento",
    email: "paula.nascimento.demo@ivmm.local",
    phone: "(82) 90000-1002",
    source: "Indicação",
    stage: "ENTREVISTA_GESTOR",
    curriculumScore: 78,
    iacScore: 83,
    ipdScore: 76,
    sceScore: 79,
    tags: "agenda, atendimento, clínica",
    summary: "Atuação em recepção de serviços de saúde, boa comunicação e experiência inicial com planilhas.",
  },
  {
    name: "Juliana Costa",
    email: "juliana.costa.demo@ivmm.local",
    phone: "(82) 90000-1003",
    source: "Kommo CRM",
    stage: "TRIAGEM",
    curriculumScore: 67,
    iacScore: 72,
    ipdScore: 64,
    sceScore: 68,
    tags: "comercial, whatsapp",
    summary: "Vivência comercial e atendimento por WhatsApp; precisa validar rotina administrativa e uso de sistemas clínicos.",
  },
  {
    name: "Renata Melo",
    email: "renata.melo.demo@ivmm.local",
    phone: "(82) 90000-1004",
    source: "LinkedIn",
    stage: "BANCO_TALENTOS",
    curriculumScore: 73,
    iacScore: 69,
    ipdScore: 71,
    sceScore: 71,
    tags: "administrativo, planilhas",
    summary: "Perfil administrativo organizado, com boa base em Excel e histórico de suporte a equipes.",
  },
  {
    name: "Camila Ferreira",
    email: "camila.ferreira.demo@ivmm.local",
    phone: "(82) 90000-1005",
    source: "Site IVMM",
    stage: "FINALISTA",
    curriculumScore: 89,
    iacScore: 88,
    ipdScore: 86,
    sceScore: 88,
    tags: "recepção, medx, crm, agenda",
    summary: "Experiência consolidada em recepção, uso de sistema clínico, confirmação de agenda e relacionamento com pacientes.",
  },
];

export async function syncRecruitmentSeedData(prisma: PrismaClient, actor: Actor) {
  const position = await prisma.recruitmentPosition.upsert({
    where: { code: "RH-CARGO-RECEP-001" },
    create: {
      code: "RH-CARGO-RECEP-001",
      title: "Recepcionista",
      department: "Administrativo",
      managerName: "Coordenação Administrativa",
      mission: "Garantir acolhimento, organização e fluidez da jornada de atendimento do paciente e dos leads do IVMM.",
      description: "Cargo responsável pela primeira experiência de atendimento, organização de agenda, comunicação multicanal e registro confiável de informações.",
      responsibilities: "Recepcionar pacientes; organizar agenda; confirmar horários; responder WhatsApp; registrar leads no Kommo CRM; apoiar rotinas administrativas; usar MedX; atualizar planilhas operacionais.",
      hardSkills: "Atendimento ao público; WhatsApp Business; Kommo CRM; MedX; Excel básico; organização de agenda; registro de informações.",
      softSkills: "Comunicação acolhedora; paciência; atenção a detalhes; discrição; colaboração; inteligência emocional; postura resolutiva.",
      tools: "MedX, WhatsApp Business, Kommo CRM, Excel, telefone.",
      education: "Ensino médio completo. Cursos administrativos ou atendimento em saúde são desejáveis.",
      experience: "Experiência anterior em recepção, atendimento, clínica, consultório ou operação administrativa.",
      behavioralProfile: "Perfil organizado, cordial, discreto, constante e atento a detalhes. Deve gostar de rotina, pessoas e processos.",
      culturalValues: "Lealdade; Dedicação; Reconhecimento; Crescimento; ética; respeito; responsabilidade; pertencimento.",
      eliminatoryCriteria: "Postura antiética; exposição indevida de dados; comunicação agressiva; baixa confiabilidade no registro de informações.",
      desirableCriteria: "Vivência em clínica, domínio de CRM, experiência com pacientes idosos e familiaridade com planilhas.",
      remunerationRange: "A definir pela administração.",
      workModel: "Presencial",
      schedule: "Horário comercial, conforme escala administrativa.",
      competencyWeights: JSON.stringify(weights),
    },
    update: {
      title: "Recepcionista",
      department: "Administrativo",
      managerName: "Coordenação Administrativa",
      mission: "Garantir acolhimento, organização e fluidez da jornada de atendimento do paciente e dos leads do IVMM.",
      description: "Cargo responsável pela primeira experiência de atendimento, organização de agenda, comunicação multicanal e registro confiável de informações.",
      responsibilities: "Recepcionar pacientes; organizar agenda; confirmar horários; responder WhatsApp; registrar leads no Kommo CRM; apoiar rotinas administrativas; usar MedX; atualizar planilhas operacionais.",
      hardSkills: "Atendimento ao público; WhatsApp Business; Kommo CRM; MedX; Excel básico; organização de agenda; registro de informações.",
      softSkills: "Comunicação acolhedora; paciência; atenção a detalhes; discrição; colaboração; inteligência emocional; postura resolutiva.",
      culturalValues: "Lealdade; Dedicação; Reconhecimento; Crescimento; ética; respeito; responsabilidade; pertencimento.",
      competencyWeights: JSON.stringify(weights),
    },
  });

  const vacancy = await prisma.recruitmentVacancy.upsert({
    where: { code: "RH-VAGA-RECEP-2026-001" },
    create: {
      code: "RH-VAGA-RECEP-2026-001",
      title: "Recepcionista",
      department: "Administrativo",
      positionId: position.id,
      status: "ABERTA",
      openings: 1,
      managerName: "Coordenação Administrativa",
      openedAt: new Date(Date.UTC(2026, 7, 1)),
      summary: "Processo seletivo estruturado para recepção do Instituto Viver Mais e Melhor.",
    },
    update: {
      positionId: position.id,
      status: "ABERTA",
      summary: "Processo seletivo estruturado para recepção do Instituto Viver Mais e Melhor.",
    },
  });

  for (const item of candidates) {
    const candidate = await prisma.recruitmentCandidate.upsert({
      where: { email: item.email },
      create: {
        name: item.name,
        email: item.email,
        phone: item.phone,
        source: item.source,
        stage: item.stage,
        status: "ATIVO",
        vacancyId: vacancy.id,
        positionId: position.id,
        resumeText: `Currículo fictício de demonstração. ${item.summary}`,
        professionalSummary: item.summary,
        curriculumScore: item.curriculumScore,
        iacScore: item.iacScore,
        ipdScore: item.ipdScore,
        sceScore: item.sceScore,
        tags: item.tags,
      },
      update: {
        name: item.name,
        phone: item.phone,
        source: item.source,
        stage: item.stage,
        status: "ATIVO",
        vacancyId: vacancy.id,
        positionId: position.id,
        resumeText: `Currículo fictício de demonstração. ${item.summary}`,
        professionalSummary: item.summary,
        curriculumScore: item.curriculumScore,
        iacScore: item.iacScore,
        ipdScore: item.ipdScore,
        sceScore: item.sceScore,
        tags: item.tags,
      },
    });

    await Promise.all([
      prisma.recruitmentStageHistory.deleteMany({ where: { candidateId: candidate.id } }),
      prisma.recruitmentEvaluation.deleteMany({ where: { candidateId: candidate.id } }),
      prisma.recruitmentAssessment.deleteMany({ where: { candidateId: candidate.id } }),
      prisma.recruitmentAiAnalysis.deleteMany({ where: { candidateId: candidate.id } }),
    ]);

    await prisma.recruitmentStageHistory.createMany({
      data: [
        { candidateId: candidate.id, stage: "INSCRICAO", notes: "Inscrição registrada no banco único.", actorName: actor.name },
        { candidateId: candidate.id, stage: item.stage, notes: "Etapa atual de demonstração.", actorName: actor.name },
      ],
    });

    await prisma.recruitmentEvaluation.createMany({
      data: [
        { candidateId: candidate.id, type: "ENTREVISTA", evaluatorName: "Coordenação Administrativa", competency: "Comunicação acolhedora", score: Math.min(5, item.iacScore / 20), evidence: "Relato estruturado de atendimento e postura cordial durante simulação.", notes: "Validar consistência em cenário de pressão." },
        { candidateId: candidate.id, type: "COMPETENCIA", evaluatorName: "Gestor Administrativo", competency: "Organização e atenção a detalhes", score: Math.min(5, item.ipdScore / 20), evidence: "Apresentou exemplos de organização de agenda e conferência de dados.", notes: "Evidência humana registrada para decisão de consenso." },
      ],
    });

    await prisma.recruitmentAssessment.create({
      data: {
        candidateId: candidate.id,
        exercise: "Simulação de recepção com agenda cheia",
        evaluatorName: "Coordenação Administrativa",
        score: Math.min(100, item.sceScore),
        evidence: "Exercício avaliou acolhimento, registro correto e priorização.",
        notes: "Assessment não decide contratação; apoia a reunião de consenso.",
      },
    });

    await prisma.recruitmentAiAnalysis.create({
      data: {
        candidateId: candidate.id,
        analysisType: "ANALISE_CURRICULAR",
        promptVersion: "mrs-ivmm-cv-v1",
        model: "assistente-configurado",
        contextUsed: "Descrição do cargo, requisitos, currículo fictício e evidências humanas disponíveis.",
        result: "Há evidências favoráveis para atendimento e organização. Pontos que exigem validação humana: rotina com CRM, reação sob pressão e aderência cultural observável.",
        requestedBy: actor.name,
      },
    });
  }
}
