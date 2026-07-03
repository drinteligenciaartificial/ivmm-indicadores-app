import { prisma } from "@/lib/prisma";
import { formatRole } from "@/lib/kpi";
import { requireFeature } from "@/lib/auth";
import { formatBrasiliaDateTime } from "@/lib/time";

export default async function HistoryPage() {
  await requireFeature("historico");
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <>
      <section className="page-header"><div><h2>Histórico de Alterações</h2><p>Registro de criação, edição e exclusão das principais entidades.</p></div></section>
      <section className="card"><div className="table-wrap"><table className="table"><thead><tr><th>Data (Brasília)</th><th>Entidade</th><th>Ação</th><th>Resumo</th><th>Usuário</th><th>Perfil</th></tr></thead><tbody>{logs.map(log=><tr key={log.id}><td>{formatBrasiliaDateTime(log.createdAt)}</td><td>{log.entity}</td><td>{log.action}</td><td>{log.summary}</td><td>{log.actorName}</td><td>{formatRole(log.actorRole)}</td></tr>)}</tbody></table></div></section>
    </>
  );
}
