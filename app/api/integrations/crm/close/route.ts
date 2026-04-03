import { NextResponse } from "next/server";
import { handleCrmClosePost, type CrmCloseBody } from "@/lib/integrations/crm/handleClosePost";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CrmCloseBody;
    const out = await handleCrmClosePost(body);
    if (!("adapter" in out)) {
      return NextResponse.json({ ok: true, synced: false, reason: out.reason });
    }
    return NextResponse.json({
      ok: out.ok,
      synced: out.synced,
      adapter: out.adapter,
      contactId: out.contactId,
      companyId: out.companyId,
      workflow: out.workflow,
    });
  } catch {
    return NextResponse.json({ ok: false, synced: false });
  }
}
