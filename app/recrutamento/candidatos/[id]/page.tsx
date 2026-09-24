import { notFound } from "next/navigation";
import { createRecruitmentAssessment, createRecruitmentEvaluation, moveRecruitmentCandidate, registerRecruitmentDecision } from "@/app/actions";
import { RecruitmentNav } from "@/components/RecruitmentNav";
import { SubmitButton } from "@/components/SubmitButton";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assessmentExercises, recruitmentStages, scoreLabel, stageLabel } from "@/lib/recruitment";

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-card">
      <span>{label}</span>
      <b>{value}%</b>
      <small>{scoreLabel(value)}</small>
      <div className="score-track"><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
    </div>
  );
}

export default async function RecruitmentCandidateDossierPage({ params }: { params: Promise<{ id: string }> }) {
  await requireFeature("recrutamento");
  const { id } = await params;
  const candidate = await prisma.recruitmentCandidate.findUnique({
    where: { id },
    include: {
      vacancy: true,
      position: true,
      stageHistory: { orderBy: { createdAt: "desc" } },
      evaluations: { orderBy: { createdAt: "desc" } },
      assessments: { orderBy: { createdAt: "desc" } },
      aiAnalyses: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!candidate) notFound();

  return (
    <>
      <section className="page-header">
        <div>
          <h2>{candidate.name}</h2>
          <p>{candidate.vacancy?.title || candidate.position?.title || "Candidato sem vaga vinculada"} · {stageLabel(candidate.stage)}</p>
        </div>
      </section>
      <RecruitmentNav />

      <section className="grid grid-4" style={{ marginTop: 18 }}>
        <ScoreCard label="Aderência curricular" value={candidate.curriculumScore} />
        <ScoreCard label="IAC cultural" value={candidate.iacScore} />
        <ScoreCard label="IPD desempenho" value={candidate.ipdScore} />
        <ScoreCard label="SCE evidências" value={candidate.sceScore} />
      </section>

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Visão geral</h3>
          <dl className="detail-list">
            <dt>Email</dt><dd>{candidate.email}</dd>
            <dt>Telefone</dt><dd>{candidate.phone || "-"}</dd>
            <dt>Origem</dt><dd>{candidate.source || "-"}</dd>
            <dt>Tags</dt><dd>{candidate.tags || "-"}</dd>
            <dt>Resumo</dt><dd>{candidate.professionalSummary || "Sem resumo registrado."}</dd>
          </dl>
        </div>

        <div className="card">
          <h3>Mover etapa</h3>
          <form action={moveRecruitmentCandidate.bind(null, candidate.id)} className="stack-form">
            <label>Nova etapa<select className="select" name="stage" defaultValue={candidate.stage}>{recruitmentStages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Observação<textarea className="textarea" name="notes" /></label>
            <SubmitButton pendingLabel="Atualizando etapa...">Salvar etapa</SubmitButton>
          </form>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Currículo e análise IA</h3>
          <p className="muted">A IA auxilia a leitura de evidências, mas não aprova nem rejeita candidatos automaticamente.</p>
          <div className="evidence-box">{candidate.resumeText || "Nenhum currículo textual registrado."}</div>
          {candidate.aiAnalyses.map((analysis) => (
            <article key={analysis.id} className="evidence-box">
              <b>{analysis.analysisType}</b>
              <p>{analysis.result}</p>
              <small>Dados usados: {analysis.contextUsed}</small>
            </article>
          ))}
        </div>

        <div className="card">
          <h3>Registrar entrevista/evidência</h3>
          <form action={createRecruitmentEvaluation.bind(null, candidate.id)} className="stack-form">
            <div className="grid grid-2">
              <label>Tipo<select className="select" name="type"><option>ENTREVISTA</option><option>COMPETENCIA</option><option>CULTURA</option><option>EXPERIENCIA</option></select></label>
              <label>Avaliador<input className="input" name="evaluatorName" defaultValue="Coordenação Administrativa" /></label>
              <label>Competência<input className="input" name="competency" /></label>
              <label>Nota<input className="input" type="number" name="score" min="0" max="5" step="0.1" required /></label>
            </div>
            <label>Evidência<textarea className="textarea" name="evidence" required /></label>
            <label>Notas<textarea className="textarea" name="notes" /></label>
            <SubmitButton pendingLabel="Registrando...">Registrar avaliação</SubmitButton>
          </form>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Assessment/Teste prático</h3>
          <form action={createRecruitmentAssessment.bind(null, candidate.id)} className="stack-form">
            <label>Exercício<select className="select" name="exercise">{assessmentExercises.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Avaliador<input className="input" name="evaluatorName" defaultValue="Coordenação Administrativa" /></label>
            <label>Score<input className="input" type="number" name="score" min="0" max="100" required /></label>
            <label>Evidência<textarea className="textarea" name="evidence" required /></label>
            <label>Notas<textarea className="textarea" name="notes" /></label>
            <SubmitButton pendingLabel="Salvando assessment...">Salvar assessment</SubmitButton>
          </form>
        </div>

        <div className="card">
          <h3>Reunião de decisão</h3>
          <form action={registerRecruitmentDecision.bind(null, candidate.id)} className="stack-form">
            <label>Decisão humana<select className="select" name="decision" defaultValue={candidate.decision || ""}><option value="">Pendente</option><option value="ADMITIR">Admitir</option><option value="BANCO_TALENTOS">Banco de talentos</option><option value="ENCERRAR">Encerrar processo</option></select></label>
            <label>Justificativa<textarea className="textarea" name="decisionJustification" required defaultValue={candidate.decisionJustification || ""} /></label>
            <SubmitButton pendingLabel="Registrando decisão...">Registrar decisão humana</SubmitButton>
          </form>
        </div>
      </section>

      <section className="grid grid-3" style={{ marginTop: 18 }}>
        <div className="card"><h3>Evidências</h3>{candidate.evaluations.map((item) => <p key={item.id} className="evidence-box"><b>{item.competency || item.type}</b><br />{item.evidence}<br /><small>{item.evaluatorName} · nota {item.score}</small></p>)}</div>
        <div className="card"><h3>Assessment</h3>{candidate.assessments.map((item) => <p key={item.id} className="evidence-box"><b>{item.exercise}</b><br />{item.evidence}<br /><small>{item.evaluatorName} · {item.score}%</small></p>)}</div>
        <div className="card"><h3>Histórico</h3>{candidate.stageHistory.map((item) => <p key={item.id} className="timeline-item"><b>{stageLabel(item.stage)}</b><br /><span>{item.notes || "Sem observação"} · {item.actorName}</span></p>)}</div>
      </section>
    </>
  );
}
