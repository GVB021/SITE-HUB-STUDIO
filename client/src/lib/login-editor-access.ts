const LOGIN_EDITOR_ALLOWED_EMAIL = "borbaggabriel@gmail.com";

function normalizeEmail(input: unknown) {
  return String(input ?? "").trim().toLowerCase();
}

export function canEditLoginTextByEmail(email: unknown) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  return normalized === LOGIN_EDITOR_ALLOWED_EMAIL;
}
