import Link from "next/link";
import { createRecruitmentCandidate, importRecruitmentCandidateDocument } from "@/app/actions";
import { RecruitmentNav } from "@/components/RecruitmentNav";
import { SubmitButton } from "@/components/SubmitButton";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recruitmentStages, scoreLabel, stageLabel } from "@/lib/recruitment";

function param(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value || "";
}

export default async function RecruitmentCandidatesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireFeature("recrutamento");
  const params = await searchParams;
  const stage = param(params, "stage");
  const source = param(params, "source");
  const query = param(params, "q").toLowerCase();
  const error = param(params, "erro");
  const [vacancies, positions, candidates] = await Promise.all([
    prisma.recruitmentVacancy.findMany({ orderBy: { openedAt: "desc" } }),
    prisma.recruitmentPosition.findMany({ orderBy: { title: "asc" } }),
    prisma.recruitmentCandidate.findMany({ include: { vacancy: true, position: true }, orderBy: { updatedAt: "desc" } }),
  ]);
  const filtered = candidates.filter((candidate) => {
    if (stage && candidate.stage !== stage) return false;
    if (source && candidate.source !== source) return false;
    if (query && !`${candidate.name} ${candidate.email} ${candidate.tags || ""}`.toLowerCase().includes(query)) return false;
    return true;
  });
  const sources = [...new Set(candidates.map((item) => item.source).filter(Boolean))];

  return (
    <>
      <section className="page-header">
        <div><h2>Candidatos</h2><p>Cadastro, busca, triagem e acesso ao dossiê do candidato.</p></div>
      </section>
      <RecruitmentNav />

      {error && <p className="notice error">Não foi possível importar o documento. Verifique se o arquivo está em PNG, JPG, PDF, DOC ou DOCX.</p>}

      <form className="card filters recruitment-candidate-filters" style={{ marginTop: 18 }}>
        <label>Buscar<input className="input" name="q" defaultValue={query} placeholder="Nome, email, tag..." /></label>
        <label>Etapa<select className="select" name="stage" defaultValue={stage}><option value="">Todas</option>{recruitmentStages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Origem<select className="select" name="source" defaultValue={source}><option value="">Todas</option>{sources.map((item) => <option key={item} value={item || ""}>{item}</option>)}</select></label>
        <div className="filter-actions"><SubmitButton pendingLabel="Filtrando...">Filtrar</SubmitButton><Link className="secondary-button" href="/recrutamento/candidatos">Limpar</Link></div>
      </form>

      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Novo candidato</h3>
          <form action={importRecruitmentCandidateDocument} className="document-import-form">
            <div>
              <label>Importar currículo ou documento
                <input className="input file-input" type="file" name="candidateDocument" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg" required />
              </label>
              <p className="muted">PDF e Word preenchem automaticamente nome, email, telefone, resumo e currículo quando o texto estiver disponível.</p>
            </div>
            <div className="grid grid-2">
              <label>Vaga<select className="select" name="vacancyId"><option value="">Sem vaga</option>{vacancies.map((vacancy) => <option key={vacancy.id} value={vacancy.id}>{vacancy.code} - {vacancy.title}</option>)}</select></label>
              <label>Cargo<select className="select" name="positionId"><option value="">Sem cargo</option>{positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}</select></label>
            </div>
            <SubmitButton pendingLabel="Lendo documento...">Importar documento</SubmitButton>
          </form>

          <div className="section-divider" />

          <form action={createRecruitmentCandidate} className="stack-form">
            <div className="grid grid-2">
              <label>Nome<input className="input" name="name" required /></label>
              <label>Email<input className="input" type="email" name="email" required /></label>
              <label>Telefone<input className="input" name="phone" /></label>
              <label>Origem<input className="input" name="source" placeholder="Kommo CRM, indicação..." /></label>
              <label>Vaga<select className="select" name="vacancyId"><option value="">Sem vaga</option>{vacancies.map((vacancy) => <option key={vacancy.id} value={vacancy.id}>{vacancy.code} - {vacancy.title}</option>)}</select></label>
              <label>Cargo<select className="select" name="positionId"><option value="">Sem cargo</option>{positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}</select></label>
              <label>Etapa<select className="select" name="stage" defaultValue="INSCRICAO">{recruitmentStages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Tags<input className="input" name="tags" /></label>
            </div>
            <label>Resumo profissional<textarea className="textarea" name="professionalSummary" /></label>
            <label>Texto do currículo<textarea className="textarea" name="resumeText" /></label>
            <SubmitButton pendingLabel="Cadastrando candidato...">Cadastrar candidato</SubmitButton>
          </form>
        </div>

        <div className="card">
          <h3>Banco de candidatos</h3>
          <div className="table-wrap">
            <table className="table compact-table">
              <thead><tr><th>Nome</th><th>Etapa</th><th>Vaga</th><th>SCE</th></tr></thead>
              <tbody>
                {filtered.map((candidate) => (
                  <tr key={candidate.id}>
                    <td><Link className="inline-link" href={`/recrutamento/candidatos/${candidate.id}`}>{candidate.name}<br /><span>{candidate.email}</span></Link></td>
                    <td>{stageLabel(candidate.stage)}</td>
                    <td>{candidate.vacancy?.title || "-"}</td>
                    <td><span className={`score-chip ${scoreLabel(candidate.sceScore).toLowerCase().replaceAll(" ", "-")}`}>{candidate.sceScore}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
