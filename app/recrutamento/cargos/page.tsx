import { createRecruitmentPosition } from "@/app/actions";
import { RecruitmentNav } from "@/components/RecruitmentNav";
import { SubmitButton } from "@/components/SubmitButton";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RecruitmentPositionsPage() {
  await requireFeature("recrutamento");
  const positions = await prisma.recruitmentPosition.findMany({ include: { vacancies: true, candidates: true }, orderBy: { title: "asc" } });

  return (
    <>
      <section className="page-header">
        <div><h2>Cargos e Requisitos</h2><p>Fonte única para missão, critérios, competências e pesos de cada cargo.</p></div>
      </section>
      <RecruitmentNav />

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Cadastrar novo cargo</h3>
          <form action={createRecruitmentPosition} className="stack-form">
            <div className="grid grid-2">
              <label>Código<input className="input" name="code" required placeholder="RH-CARGO-..." /></label>
              <label>Cargo<input className="input" name="title" required /></label>
              <label>Departamento<input className="input" name="department" required /></label>
              <label>Gestor padrão<input className="input" name="managerName" /></label>
            </div>
            <label>Missão<textarea className="textarea" name="mission" required /></label>
            <label>Descrição<textarea className="textarea" name="description" required /></label>
            <label>Responsabilidades<textarea className="textarea" name="responsibilities" required /></label>
            <label>Hard skills<textarea className="textarea" name="hardSkills" required /></label>
            <label>Soft skills<textarea className="textarea" name="softSkills" required /></label>
            <label>Valores culturais<textarea className="textarea" name="culturalValues" required defaultValue="Lealdade; Dedicação; Reconhecimento; Crescimento" /></label>
            <div className="grid grid-2">
              <label>Ferramentas<input className="input" name="tools" /></label>
              <label>Remuneração<input className="input" name="remunerationRange" /></label>
              <label>Modelo<input className="input" name="workModel" /></label>
              <label>Horário<input className="input" name="schedule" /></label>
            </div>
            <SubmitButton pendingLabel="Salvando cargo...">Cadastrar cargo</SubmitButton>
          </form>
        </div>

        <div className="card">
          <h3>Cargos cadastrados</h3>
          <div className="position-list">
            {positions.map((position) => (
              <article key={position.id} className="position-card">
                <span>{position.code}</span>
                <h4>{position.title}</h4>
                <p>{position.mission}</p>
                <div className="mini-metrics">
                  <b>{position.vacancies.length}</b><small>vaga(s)</small>
                  <b>{position.candidates.length}</b><small>candidato(s)</small>
                </div>
                <dl>
                  <dt>Hard skills</dt><dd>{position.hardSkills}</dd>
                  <dt>Soft skills</dt><dd>{position.softSkills}</dd>
                  <dt>Critérios eliminatórios</dt><dd>{position.eliminatoryCriteria || "Não informado"}</dd>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
