import { RecruitmentNav } from "@/components/RecruitmentNav";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assessmentExercises } from "@/lib/recruitment";

export default async function RecruitmentAssessmentPage() {
  await requireFeature("recrutamento");
  const assessments = await prisma.recruitmentAssessment.findMany({ include: { candidate: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <section className="page-header"><div><h2>Assessment/Testes Práticos</h2><p>Exercícios situacionais para observar competências em fontes complementares.</p></div></section>
      <RecruitmentNav />
      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card"><h3>Cenários padrão</h3>{assessmentExercises.map((item) => <p key={item} className="evidence-box">{item}</p>)}</div>
        <div className="card"><h3>Resultados de assessment</h3>{assessments.map((item) => <p key={item.id} className="evidence-box"><b>{item.candidate.name}</b><br />{item.exercise}<br />{item.evidence}<br /><small>{item.evaluatorName} · {item.score}%</small></p>)}</div>
      </section>
    </>
  );
}
