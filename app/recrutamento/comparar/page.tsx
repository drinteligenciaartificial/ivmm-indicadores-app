import Link from "next/link";
import { RecruitmentNav } from "@/components/RecruitmentNav";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreLabel, stageLabel } from "@/lib/recruitment";

export default async function RecruitmentComparePage() {
  await requireFeature("recrutamento");
  const candidates = await prisma.recruitmentCandidate.findMany({ include: { vacancy: true }, orderBy: [{ sceScore: "desc" }, { curriculumScore: "desc" }] });
  return (
    <>
      <section className="page-header"><div><h2>Comparar Candidatos</h2><p>Comparação objetiva, com evidências e sem decisão automática.</p></div></section>
      <RecruitmentNav />
      <section className="card" style={{ marginTop: 18 }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Candidato</th><th>Vaga</th><th>Etapa</th><th>Currículo</th><th>IAC</th><th>IPD</th><th>SCE</th><th>Leitura</th></tr></thead>
            <tbody>{candidates.map((candidate) => <tr key={candidate.id}><td><Link className="inline-link" href={`/recrutamento/candidatos/${candidate.id}`}>{candidate.name}</Link></td><td>{candidate.vacancy?.title || "-"}</td><td>{stageLabel(candidate.stage)}</td><td>{candidate.curriculumScore}%</td><td>{candidate.iacScore}%</td><td>{candidate.ipdScore}%</td><td>{candidate.sceScore}%</td><td>{scoreLabel(candidate.sceScore)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}
