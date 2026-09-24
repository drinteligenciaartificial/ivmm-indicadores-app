import Link from "next/link";
import { createRecruitmentVacancy } from "@/app/actions";
import { RecruitmentNav } from "@/components/RecruitmentNav";
import { SubmitButton } from "@/components/SubmitButton";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recruitmentStages, stageLabel, vacancyStatuses } from "@/lib/recruitment";

export default async function RecruitmentProcessesPage() {
  await requireFeature("recrutamento");
  const [positions, vacancies, candidates] = await Promise.all([
    prisma.recruitmentPosition.findMany({ orderBy: { title: "asc" } }),
    prisma.recruitmentVacancy.findMany({ include: { position: true, candidates: true }, orderBy: { openedAt: "desc" } }),
    prisma.recruitmentCandidate.findMany({ include: { vacancy: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  return (
    <>
      <section className="page-header">
        <div><h2>Processos Seletivos</h2><p>Vagas e pipeline de candidatos por etapa.</p></div>
      </section>
      <RecruitmentNav />

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Nova vaga</h3>
          <form action={createRecruitmentVacancy} className="stack-form">
            <div className="grid grid-2">
              <label>Código<input className="input" name="code" required placeholder="RH-VAGA-..." /></label>
              <label>Título<input className="input" name="title" required /></label>
              <label>Departamento<input className="input" name="department" required /></label>
              <label>Cargo<select className="select" name="positionId" required>{positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}</select></label>
              <label>Status<select className="select" name="status">{vacancyStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Vagas<input className="input" type="number" min="1" name="openings" defaultValue="1" required /></label>
              <label>Gestor<input className="input" name="managerName" /></label>
            </div>
            <label>Resumo<textarea className="textarea" name="summary" /></label>
            <SubmitButton pendingLabel="Criando vaga...">Criar vaga</SubmitButton>
          </form>
        </div>

        <div className="card">
          <h3>Vagas</h3>
          <div className="table-wrap">
            <table className="table compact-table">
              <thead><tr><th>Código</th><th>Status</th><th>Candidatos</th><th>Abertura</th></tr></thead>
              <tbody>{vacancies.map((vacancy) => <tr key={vacancy.id}><td>{vacancy.code}<br /><span>{vacancy.title}</span></td><td>{vacancy.status.replaceAll("_", " ")}</td><td>{vacancy.candidates.length}</td><td>{vacancy.openedAt.toISOString().slice(0, 10)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="pipeline-board" style={{ marginTop: 18 }}>
        {recruitmentStages.map(([stage]) => {
          const items = candidates.filter((candidate) => candidate.stage === stage);
          if (!items.length) return null;
          return (
            <div key={stage} className="pipeline-column">
              <h3>{stageLabel(stage)} <span>{items.length}</span></h3>
              {items.map((candidate) => (
                <Link key={candidate.id} href={`/recrutamento/candidatos/${candidate.id}`} className="pipeline-card">
                  <b>{candidate.name}</b>
                  <small>{candidate.vacancy?.title || "Sem vaga"}</small>
                </Link>
              ))}
            </div>
          );
        })}
      </section>
    </>
  );
}
