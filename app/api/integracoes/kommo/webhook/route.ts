import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { refreshKommoRecord } from "@/lib/kommo";

const typeMap: Record<string, string> = { leads: "LEAD", contacts: "CONTACT", companies: "COMPANY" };

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const values = new URLSearchParams(raw);
  const changes = new Map<string, { type: string; id: string }>();
  for (const [key, value] of values.entries()) {
    const match = key.match(/^(leads|contacts|companies)\[(?:add|update|status|responsible)\]\[\d+\]\[id\]$/);
    if (match && value) {
      const type = typeMap[match[1]];
      changes.set(`${type}:${value}`, { type, id: value });
    }
  }
  after(async () => {
    for (const change of changes.values()) {
      try { await refreshKommoRecord(change.type, change.id); } catch { /* A próxima sincronização fará a recuperação. */ }
    }
  });
  return NextResponse.json({ accepted: true }, { status: 202 });
}
