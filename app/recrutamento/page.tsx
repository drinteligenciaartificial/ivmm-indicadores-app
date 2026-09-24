import Link from "next/link";
import { KpiCard } from "@/components/KpiCard";
import { RecruitmentNav } from "@/components/RecruitmentNav";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { average, recruitmentStages, scoreLabel, stageLabel } from "@/lib/recruitment";

export default async function RecruitmentDashboardPage() {
  await requireFeature("recrutamento");
  const [vacancies, candidates] = await Promise.all([
    prisma.recruitmentVacancy.findMany({ include: { position: true, candidates: true }, orderBy: { openedAt: "desc" } }),
    prisma.recruitmentCandidate.findMany({ include: { vacancy: true, position: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  const activeCandidates = candidates.filter((item) => item.status === "ATIVO");
  const admitted = candidates.filter((item) => ["ADMISSAO", "ONBOARDING", "EFETIVADO"].includes(item.stage));
  const stageCounts = recruitmentStages.map(([stage, label]) => ({
    stage,
    label,
    count: candidates.filter((candidate) => candidate.stage === stage).length,
  })).filter((item) => item.count > 0);
  const maxStageCount = Math.max(...stageCounts.map((item) => item.count), 1);

  return (
    <>
      <section className="page-header">
        <div>
          <h2>MRS-IVMM</h2>
          <p>Pessoas certas. Cultura forte. Crescimento sustentável.</p>
        </div>
        <Link className="button" href="/recrutamento/candidatos">Banco de candidatos</Link>
      </section>
      <RecruitmentNav />

      <section className="grid grid-4" style={{ marginTop: 18 }}>
        <KpiCard label="Vagas abertas" value={vacancies.filter((item) => ["ABERTA", "EM_SELECAO", "FINALISTA"].includes(item.status)).length} />
        <KpiCard label="Candidatos ativos" value={activeCandidates.length} />
        <KpiCard label="Score curricular médio" value={`${average(candidates.map((item) => item.curriculumScore))}%`} />
        <KpiCard label="Admissões/Onboarding" value={admitted.length} />
      </section>

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Funil de recrutamento</h3>
          <div className="funnel-list">
            {stageCounts.map((item) => (
              <div key={item.stage} className="funnel-row">
                <span>{item.label}</span>
                <div className="funnel-bar"><i style={{ width: `${Math.max(12, item.count / maxStageCount * 100)}%` }} /></div>
                <b>{item.count}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Vagas em andamento</h3>
          <div className="table-wrap">
            <table className="table compact-table">
              <thead><tr><th>Vaga</th><th>Status</th><th>Candidatos</th><th>Gestor</th></tr></thead>
              <tbody>
                {vacancies.map((vacancy) => (
                  <tr key={vacancy.id}>
                    <td><Link className="inline-link" href="/recrutamento/processos">{vacancy.code}<br /><span>{vacancy.title}</span></Link></td>
                    <td>{vacancy.status.replaceAll("_", " ")}</td>
                    <td>{vacancy.candidates.length}</td>
                    <td>{vacancy.managerName || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <h3>Candidatos recentes</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Candidato</th><th>Vaga</th><th>Etapa</th><th>Currículo</th><th>IAC</th><th>IPD</th><th>SCE</th></tr></thead>
            <tbody>
              {candidates.slice(0, 8).map((candidate) => (
                <tr key={candidate.id}>
                  <td><Link className="inline-link" href={`/recrutamento/candidatos/${candidate.id}`}>{candidate.name}<br /><span>{candidate.source || "Origem não informada"}</span></Link></td>
                  <td>{candidate.vacancy?.title || "-"}</td>
                  <td>{stageLabel(candidate.stage)}</td>
                  <td><span className={`score-chip ${scoreLabel(candidate.curriculumScore).toLowerCase().replaceAll(" ", "-")}`}>{candidate.curriculumScore}%</span></td>
                  <td>{candidate.iacScore}%</td>
                  <td>{candidate.ipdScore}%</td>
                  <td>{candidate.sceScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
