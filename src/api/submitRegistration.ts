import { MESSAGES } from "../constants";
import type { RegistrationPayload, SubmitResult } from "../types";

function isConfiguredUrl(url: string | undefined): url is string {
  if (!url) {
    return false;
  }
  const trimmed = url.trim();
  return (
    trimmed.length > 0 &&
    trimmed !== "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL" &&
    /^https:\/\//i.test(trimmed)
  );
}

function readErrorMessage(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string" &&
    data.error.trim().length > 0
  ) {
    return data.error;
  }
  return MESSAGES.genericFailure;
}

/**
 * Submits via a "simple" POST (text/plain JSON) so Apps Script is not
 * blocked by a CORS preflight. Success is shown only after a readable JSON
 * body with ok: true is received. Opaque / no-cors responses are treated as
 * failure because they cannot confirm that a spreadsheet row was written.
 */
export async function submitRegistration(
  payload: RegistrationPayload,
): Promise<SubmitResult> {
  const url = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!isConfiguredUrl(url)) {
    return { ok: false, error: MESSAGES.configMissing };
  }

  let response: Response;
  try {
    response = await fetch(url.trim(), {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: MESSAGES.network };
  }

  if (!response.ok) {
    return { ok: false, error: MESSAGES.genericFailure };
  }

  let data: unknown;
  try {
    const text = await response.text();
    data = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, error: MESSAGES.unconfirmed };
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "ok" in data &&
    data.ok === true
  ) {
    return { ok: true };
  }

  return { ok: false, error: readErrorMessage(data) };
}
