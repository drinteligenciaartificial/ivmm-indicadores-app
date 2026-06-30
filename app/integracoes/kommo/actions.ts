"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { disconnectKommo, syncKommo } from "@/lib/kommo";

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
