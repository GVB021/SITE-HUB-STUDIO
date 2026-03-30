export type SimplifiedRegisterInput = {
  email: string;
  fullName: string;
  password: string;
  studioId: string;
  whatsapp: string;
  birthDate: string;
};

export function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

export function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

export function maskBrazilWhatsapp(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskBirthDate(value: string) {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export function parseBirthDate(brDate: string) {
  const m = String(brDate || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

export function isAtLeastAge(date: Date, minAgeYears: number, now = new Date()) {
  const todayY = now.getUTCFullYear();
  const todayM = now.getUTCMonth();
  const todayD = now.getUTCDate();
  const birthY = date.getUTCFullYear();
  const birthM = date.getUTCMonth();
  const birthD = date.getUTCDate();
  let age = todayY - birthY;
  if (todayM < birthM || (todayM === birthM && todayD < birthD)) age -= 1;
  return age >= minAgeYears;
}

export function validateSimplifiedRegisterInput(input: SimplifiedRegisterInput) {
  const errors: Partial<Record<keyof SimplifiedRegisterInput, string>> = {};
  const email = normalizeEmail(input.email);
  if (!email) errors.email = "Email é obrigatório";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email inválido";

  const fullName = String(input.fullName || "").trim();
  if (!fullName) errors.fullName = "Nome completo é obrigatório";
  else if (fullName.length < 3) errors.fullName = "Nome completo inválido";

  const password = String(input.password || "");
  if (!password) errors.password = "Senha é obrigatória";
  else if (password.length < 8) errors.password = "Senha deve ter pelo menos 8 caracteres";

  const studioId = String(input.studioId || "").trim();
  if (!studioId) errors.studioId = "Selecione um estúdio";

  const phoneDigits = onlyDigits(input.whatsapp);
  if (!phoneDigits) errors.whatsapp = "WhatsApp é obrigatório";
  else if (!/^\d{10,11}$/.test(phoneDigits)) errors.whatsapp = "WhatsApp inválido";
  else if (phoneDigits.length === 11 && phoneDigits[2] !== "9") errors.whatsapp = "WhatsApp inválido";

  const birth = parseBirthDate(input.birthDate);
  if (!birth) errors.birthDate = "Data de nascimento inválida";
  else if (!isAtLeastAge(birth, 16)) errors.birthDate = "Idade mínima de 16 anos";

  return errors;
}

