import { NextResponse } from "next/server";
import { handleCrmClosePost, type CrmCloseBody } from "@/lib/integrations/crm/handleClosePost";

/** @deprecated Prefer `POST /api/integrations/crm/close` — same handler, provider from `CRM_PROVIDER`. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CrmCloseBody;
    const out = await handleCrmClosePost(body);
    if (!("adapter" in out)) {
      return NextResponse.json({ ok: true, synced: false });
    }
    return NextResponse.json({
      ok: out.ok,
      synced: out.synced,
      workflow: out.workflow,
    });
  } catch {
    return NextResponse.json({ ok: false, synced: false });
  }
}
