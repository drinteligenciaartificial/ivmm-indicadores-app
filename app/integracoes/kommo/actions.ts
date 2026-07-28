"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { generateKommoFunnelResults } from "@/lib/kommo-kpis";
import { disconnectKommo, syncKommo } from "@/lib/kommo";
import { prisma } from "@/lib/prisma";

export async function synchronizeKommo() {
  const user = await requireAdmin();
  let imported: number;
  try {
    imported = await syncKommo();
  } catch {
    revalidatePath("/integracoes/kommo");
    redirect("/integracoes/kommo?erro=sincronizacao");
  }
  await audit(user, "Integração Kommo", "SINCRONIZAR", `${imported} registros processados`);
  revalidatePath("/integracoes/kommo");
  redirect(`/integracoes/kommo?ok=${imported}`);
}

export async function removeKommoConnection() {
  const user = await requireAdmin();
  await disconnectKommo();
  await audit(user, "Integração Kommo", "DESCONECTAR", "Acesso ao Kommo removido");
  revalidatePath("/integracoes/kommo");
  redirect("/integracoes/kommo?desconectado=1");
}

export async function publishKommoFunnelResults() {
  const user = await requireAdmin();
  let summary: Awaited<ReturnType<typeof generateKommoFunnelResults>>;
  try {
    summary = await generateKommoFunnelResults(prisma);
  } catch {
    revalidatePath("/integracoes/kommo");
    redirect("/integracoes/kommo?erro=indicadores");
  }
  await audit(user, "Integração Kommo", "GERAR INDICADORES", `${summary.created} novo(s), ${summary.updated} atualizado(s), ${summary.months} mês(es), indicadores: ${summary.indicators.join(", ") || "nenhum"}`);
  revalidatePath("/");
  revalidatePath("/resultados");
  revalidatePath("/integracoes/kommo");
  redirect(`/integracoes/kommo?indicadores=${summary.created + summary.updated}&novos=${summary.created}&atualizados=${summary.updated}&meses=${summary.months}`);
}
