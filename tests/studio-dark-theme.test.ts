import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function sRgbToLinear(v: number) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const value = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = Number.parseInt(value, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function contrastRatio(a: string, b: string) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const la = 0.2126 * sRgbToLinear(ca.r) + 0.7152 * sRgbToLinear(ca.g) + 0.0722 * sRgbToLinear(ca.b);
  const lb = 0.2126 * sRgbToLinear(cb.r) + 0.7152 * sRgbToLinear(cb.g) + 0.0722 * sRgbToLinear(cb.b);
  const [l1, l2] = la >= lb ? [la, lb] : [lb, la];
  return (l1 + 0.05) / (l2 + 0.05);
}

test("tema escuro do estúdio mantém contraste AA em pares principais", () => {
  const normalPairs: Array<[string, string]> = [
    ["#F3F4F6", "#0B0D14"],
    ["#E5E7EB", "#161A24"],
    ["#9CA3AF", "#0F131C"],
  ];
  for (const [fg, bg] of normalPairs) {
    assert.ok(contrastRatio(fg, bg) >= 4.5, `Contraste insuficiente ${fg}/${bg}`);
  }
});

test("estúdio usa esquema escuro fixo e app principal mantém tema atual", () => {
  const studioCssPath = path.resolve(process.cwd(), "client/src/studio/index.css");
  const appCssPath = path.resolve(process.cwd(), "client/src/index.css");
  const studioCss = fs.readFileSync(studioCssPath, "utf8");
  const appCss = fs.readFileSync(appCssPath, "utf8");

  assert.equal(studioCss.includes("color-scheme: dark;"), true);
  assert.equal(studioCss.includes("--background: 224 22% 7%;"), true);
  assert.equal(studioCss.includes("--foreground: 220 24% 95%;"), true);
  assert.equal(studioCss.includes("--sidebar-background: 224 20% 9%;"), true);

  assert.equal(appCss.includes("color-scheme: light;"), true);
});

