// Allowed email domains for the Solutions Showcase Portal email gate.
// Edit this array to add or remove permitted domains.
export const ALLOWED_EMAIL_DOMAINS = ["mobiusservices.com", "mobius365.com", "techmobius.com"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { valid: false, error: "Please enter your email address" };
  if (!EMAIL_RE.test(trimmed)) return { valid: false, error: "That doesn't look like a valid email" };
  const domain = trimmed.split("@")[1];
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return {
      valid: false,
      error: `Please use your official @${ALLOWED_EMAIL_DOMAINS[0]} email`,
    };
  }
  return { valid: true };
}

const EMAIL_KEY = "mks_portal_email";
const SESSION_KEY = "mks_portal_session";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function setStoredEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
}

export function clearStoredEmail() {
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(SESSION_KEY);
}
