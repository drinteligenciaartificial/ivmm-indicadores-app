import Link from "next/link";
import { BarChart3, Cable, CircleCheck, RefreshCw, Unplug } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { kommoEnvironmentReady, kommoRedirectUri } from "@/lib/kommo";
import { prisma } from "@/lib/prisma";
import { publishKommoFunnelResults, removeKommoConnection, synchronizeKommo } from "./actions";

const entityLabels: Record<string, string> = {
  LEAD: "Leads",
  CONTACT: "Contatos",
  COMPANY: "Empresas",
  USER: "Usuários",
  PIPELINE: "Funis",
};

function dateTime(value?: Date | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(value) : "Ainda não realizada";
}

export default async function KommoIntegrationPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const connection = await prisma.integrationConnection.findUnique({
    where: { provider: "KOMMO" },
    include: { syncs: { orderBy: { startedAt: "desc" }, take: 8 } },
  });
  const grouped = connection ? await prisma.externalCrmRecord.groupBy({
    by: ["entityType"],
    where: { integrationId: connection.id },
    _count: { _all: true },
    orderBy: { entityType: "asc" },
  }) : [];
  const connected = connection?.status !== "DESCONECTADO" && Boolean(connection?.accessToken);
  const environmentReady = kommoEnvironmentReady();

  return (
    <>
      <section className="page-header">
        <div>
          <h2>Integração com Kommo</h2>
          <p>Conecte o CRM, importe os dados e acompanhe cada sincronização.</p>
        </div>
        <span className={`integration-status ${connected ? "connected" : "disconnected"}`}>
          {connected ? <CircleCheck aria-hidden="true" size={17} /> : <Unplug aria-hidden="true" size={17} />}
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </section>

      {params.conectado && <p className="notice success">Kommo conectado. Faça a primeira sincronização para importar os dados.</p>}
      {params.ok && <p className="notice success">Sincronização concluída: {params.ok} registros processados.</p>}
      {params.indicadores && <p className="notice success">Indicadores do funil gerados: {params.indicadores} resultado(s), sendo {params.novos ?? 0} novo(s) e {params.atualizados ?? 0} atualizado(s), em {params.meses ?? 0} mês(es).</p>}
      {params.erro === "oauth" && <p className="notice error">Não foi possível concluir a autorização no Kommo.</p>}
      {params.erro === "sincronizacao" && <p className="notice error">A sincronização encontrou um erro. Consulte o diagnóstico abaixo.</p>}
      {params.erro === "indicadores" && <p className="notice error">Não foi possível gerar os indicadores do funil com os dados importados do Kommo.</p>}
      {!environmentReady && <p className="notice error">As credenciais do Kommo ainda precisam ser configuradas no ambiente do Render.</p>}

      <section className="integration-summary">
        <div>
          <span>Conta</span>
          <strong>{connection?.accountName || connection?.subdomain || "Nenhuma conta conectada"}</strong>
        </div>
        <div>
          <span>Última sincronização</span>
          <strong>{dateTime(connection?.lastSyncAt)}</strong>
        </div>
        <div>
          <span>Situação</span>
          <strong>{connection?.lastError ? "Requer atenção" : connected ? "Operacional" : "Aguardando conexão"}</strong>
        </div>
      </section>

      <section className="toolbar integration-actions">
        {!connected ? (
          <Link className={`button${environmentReady ? "" : " disabled"}`} aria-disabled={!environmentReady} href={environmentReady ? "/api/integracoes/kommo/conectar" : "#"}>
            <Cable aria-hidden="true" size={17} /> Conectar Kommo
          </Link>
        ) : (
          <>
            <form action={synchronizeKommo}><button className="button" type="submit"><RefreshCw aria-hidden="true" size={17} /> Sincronizar agora</button></form>
            <form action={publishKommoFunnelResults}><button className="button secondary" type="submit"><BarChart3 aria-hidden="true" size={17} /> Gerar indicadores</button></form>
            <form action={removeKommoConnection}><button className="button secondary" type="submit"><Unplug aria-hidden="true" size={17} /> Desconectar</button></form>
          </>
        )}
      </section>

      {connection?.lastError && <section className="notice error"><strong>Diagnóstico:</strong> {connection.lastError}</section>}

      <section style={{ marginTop: 24 }}>
        <h3>Dados importados</h3>
        <div className="grid grid-4">
          {Object.entries(entityLabels).map(([key, label]) => {
            const item = grouped.find((group) => group.entityType === key);
            return <div className="card" key={key}><div className="metric-label">{label}</div><div className="metric-value">{item?._count._all ?? 0}</div></div>;
          })}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Histórico de sincronizações</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Início</th><th>Situação</th><th>Registros</th><th>Conclusão</th></tr></thead>
            <tbody>
              {connection?.syncs.length ? connection.syncs.map((sync) => (
                <tr key={sync.id}><td>{dateTime(sync.startedAt)}</td><td>{sync.status}</td><td>{sync.importedCount}</td><td>{dateTime(sync.finishedAt)}</td></tr>
              )) : <tr><td colSpan={4}>Nenhuma sincronização registrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <details className="technical-details">
        <summary>Endereços configurados</summary>
        <p><strong>Retorno OAuth:</strong> {kommoRedirectUri()}</p>
        <p><strong>Webhook:</strong> https://ivmm-indicadores-app.onrender.com/api/integracoes/kommo/webhook</p>
      </details>
    </>
  );
}
