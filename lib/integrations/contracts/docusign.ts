/**
 * DocuSign — embedded signing after verbal close (server-side only).
 *
 * Env: `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_USER_ID`, `DOCUSIGN_ACCOUNT_ID`,
 * `DOCUSIGN_RSA_PRIVATE_KEY` (PEM or base64), `DOCUSIGN_AUTH_SERVER` (default account.docusign.com).
 *
 * Flow: create envelope from template → recipient view → tablet WebView loads `url`.
 */

export type DocusignEmbeddedSession = {
  envelopeId: string;
  /** Short-lived URL for embedded signing (recipient view). */
  recipientViewUrl: string;
  expiresAt: string;
};

export type CreateEmbeddedSignPayload = {
  signerEmail: string;
  signerName: string;
  clientUserId: string;
  templateId?: string;
  /** Tab prefill: logical name → value */
  tabs?: Record<string, string>;
  returnUrl: string;
};

/**
 * JWT auth + envelope + recipient view. Stub returns null until credentials exist.
 */
export async function createEmbeddedSigningSession(
  _payload: CreateEmbeddedSignPayload
): Promise<DocusignEmbeddedSession | null> {
  void _payload;
  const has =
    process.env.DOCUSIGN_INTEGRATION_KEY &&
    process.env.DOCUSIGN_USER_ID &&
    process.env.DOCUSIGN_ACCOUNT_ID &&
    process.env.DOCUSIGN_RSA_PRIVATE_KEY;
  if (!has) return null;

  // Implement: JWT grant → POST /v2.1/accounts/{accountId}/envelopes
  // → POST .../envelopes/{id}/views/recipient
  return null;
}

export async function getEnvelopeStatus(_envelopeId: string): Promise<"sent" | "completed" | "voided" | "unknown"> {
  void _envelopeId;
  return "unknown";
}
