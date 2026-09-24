import { RecruitmentNav } from "@/components/RecruitmentNav";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { interviewQuestions } from "@/lib/recruitment";

export default async function RecruitmentInterviewsPage() {
  await requireFeature("recrutamento");
  const evaluations = await prisma.recruitmentEvaluation.findMany({ where: { type: "ENTREVISTA" }, include: { candidate: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <section className="page-header"><div><h2>Entrevistas</h2><p>Roteiro estruturado com registro de evidências no padrão STAR.</p></div></section>
      <RecruitmentNav />
      <section className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card"><h3>Roteiro inicial</h3><ol className="ordered-list">{interviewQuestions.map((item) => <li key={item}>{item}</li>)}</ol></div>
        <div className="card"><h3>Evidências registradas</h3>{evaluations.map((item) => <p key={item.id} className="evidence-box"><b>{item.candidate.name}</b><br />{item.evidence}<br /><small>{item.evaluatorName} · {item.competency || "Entrevista"}</small></p>)}</div>
      </section>
    </>
  );
}
