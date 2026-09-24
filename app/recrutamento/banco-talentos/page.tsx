import Link from "next/link";
import { RecruitmentNav } from "@/components/RecruitmentNav";
import { requireFeature } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TalentBankPage() {
  await requireFeature("recrutamento");
  const candidates = await prisma.recruitmentCandidate.findMany({ where: { OR: [{ stage: "BANCO_TALENTOS" }, { tags: { contains: "recepção" } }] }, include: { position: true }, orderBy: { updatedAt: "desc" } });
  return (
    <>
      <section className="page-header"><div><h2>Banco de Talentos</h2><p>Candidatos preservados para futuras vagas e buscas por competência.</p></div></section>
      <RecruitmentNav />
      <section className="grid grid-3" style={{ marginTop: 18 }}>
        {candidates.map((candidate) => <Link href={`/recrutamento/candidatos/${candidate.id}`} className="candidate-tile" key={candidate.id}><b>{candidate.name}</b><span>{candidate.position?.title || "Cargo não vinculado"}</span><p>{candidate.tags || "Sem tags"}</p><small>SCE {candidate.sceScore}%</small></Link>)}
      </section>
    </>
  );
}
