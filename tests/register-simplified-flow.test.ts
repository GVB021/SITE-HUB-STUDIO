import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  maskBirthDate,
  maskBrazilWhatsapp,
  parseBirthDate,
  validateSimplifiedRegisterInput,
} from "../shared/register-validation.ts";

test("máscara de WhatsApp formata celular brasileiro", () => {
  assert.equal(maskBrazilWhatsapp("11987654321"), "(11) 98765-4321");
  assert.equal(maskBrazilWhatsapp("11 98765-4321"), "(11) 98765-4321");
});

test("máscara de data formata DD/MM/AAAA", () => {
  assert.equal(maskBirthDate("01021999"), "01/02/1999");
  assert.equal(maskBirthDate("01a02b1999"), "01/02/1999");
});

test("validação exige idade mínima de 16 anos e senha mínima 8", () => {
  const invalid = validateSimplifiedRegisterInput({
    email: "teste@estudio.com",
    fullName: "Pessoa Teste",
    password: "1234567",
    studioId: "studio-1",
    whatsapp: "(11) 98765-4321",
    birthDate: "01/01/2015",
  });
  assert.equal(invalid.password, "Senha deve ter pelo menos 8 caracteres");
  assert.equal(invalid.birthDate, "Idade mínima de 16 anos");
});

test("validação aceita payload válido", () => {
  const valid = validateSimplifiedRegisterInput({
    email: "usuario@estudio.com",
    fullName: "Usuário Válido",
    password: "senha1234",
    studioId: "studio-1",
    whatsapp: "(11) 98765-4321",
    birthDate: "01/01/1990",
  });
  assert.equal(Object.keys(valid).length, 0);
  assert.ok(parseBirthDate("01/01/1990"));
});

test("backend de cadastro define conta ativa e vínculo aprovado", () => {
  const routePath = path.resolve(process.cwd(), "server/replit_integrations/auth/routes.ts");
  const source = fs.readFileSync(routePath, "utf8");
  assert.equal(source.includes('status: "approved"'), true);
  assert.equal(source.includes('role: "dublador"'), true);
  assert.equal(source.includes("req.login(user"), true);
  assert.equal(source.includes("Este email ja esta em uso"), true);
  assert.equal(source.includes("Estudio selecionado nao encontrado"), true);
});

