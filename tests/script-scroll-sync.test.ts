import test from "node:test";
import assert from "node:assert/strict";
import {
  buildScrollAnchors,
  computeAdaptiveMaxSpeedPxPerSec,
  interpolateScrollTop,
  smoothScrollStep,
} from "../client/src/studio/lib/script-scroll-sync.ts";

test("interpolação temporal retorna posição progressiva sem saltos", () => {
  const anchors = buildScrollAnchors({
    lineStarts: [0, 10, 20],
    lineOffsets: [0, 500, 1000],
    lineHeights: [100, 100, 100],
    viewportHeight: 200,
    maxScrollTop: 1200,
  });
  const a = interpolateScrollTop(anchors, 5);
  const b = interpolateScrollTop(anchors, 10);
  const c = interpolateScrollTop(anchors, 15);
  assert.ok(a < b && b < c);
  assert.ok(Math.abs(b - 450) < 0.001);
});

test("velocidade adaptativa aumenta com maior densidade de texto", () => {
  const low = computeAdaptiveMaxSpeedPxPerSec({
    contentHeight: 2000,
    viewportHeight: 800,
    videoDuration: 300,
    lineCount: 80,
    seeking: false,
  });
  const high = computeAdaptiveMaxSpeedPxPerSec({
    contentHeight: 14000,
    viewportHeight: 800,
    videoDuration: 300,
    lineCount: 480,
    seeking: false,
  });
  assert.ok(high > low);
});

test("passo suavizado respeita limite máximo e converge para alvo", () => {
  let current = 0;
  const target = 1200;
  for (let i = 0; i < 240; i++) {
    current = smoothScrollStep({
      current,
      target,
      dtSeconds: 1 / 60,
      maxSpeedPxPerSec: 600,
      response: 10,
    });
  }
  assert.ok(current > 1100 && current <= 1200);
});

test("modo seeking libera velocidade maior para resincronização", () => {
  const normal = computeAdaptiveMaxSpeedPxPerSec({
    contentHeight: 10000,
    viewportHeight: 900,
    videoDuration: 1800,
    lineCount: 350,
    seeking: false,
  });
  const seeking = computeAdaptiveMaxSpeedPxPerSec({
    contentHeight: 10000,
    viewportHeight: 900,
    videoDuration: 1800,
    lineCount: 350,
    seeking: true,
  });
  assert.ok(seeking >= 3200);
  assert.ok(seeking > normal);
});

test("suavização mantém consistência em diferentes taxas de frames", () => {
  const run = (fps: number) => {
    let current = 0;
    const target = 900;
    const dt = 1 / fps;
    for (let i = 0; i < fps * 3; i++) {
      current = smoothScrollStep({
        current,
        target,
        dtSeconds: dt,
        maxSpeedPxPerSec: 700,
        response: 12,
      });
    }
    return current;
  };
  const at30 = run(30);
  const at60 = run(60);
  const at120 = run(120);
  assert.ok(Math.abs(at30 - at60) < 20);
  assert.ok(Math.abs(at60 - at120) < 20);
});
