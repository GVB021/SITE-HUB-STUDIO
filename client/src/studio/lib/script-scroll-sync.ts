export interface ScrollAnchor {
  time: number;
  scrollTop: number;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function buildScrollAnchors(params: {
  lineStarts: number[];
  lineOffsets: number[];
  lineHeights: number[];
  viewportHeight: number;
  maxScrollTop: number;
}) {
  const { lineStarts, lineOffsets, lineHeights, viewportHeight, maxScrollTop } = params;
  const anchors: ScrollAnchor[] = [];
  for (let i = 0; i < lineStarts.length; i++) {
    const center = lineOffsets[i] + lineHeights[i] / 2 - viewportHeight / 2;
    anchors.push({
      time: Math.max(0, lineStarts[i] || 0),
      scrollTop: clamp(center, 0, Math.max(0, maxScrollTop)),
    });
  }
  return anchors.sort((a, b) => a.time - b.time);
}

export function interpolateScrollTop(anchors: ScrollAnchor[], videoTime: number) {
  if (!anchors.length) return 0;
  if (anchors.length === 1) return anchors[0].scrollTop;
  if (videoTime <= anchors[0].time) return anchors[0].scrollTop;
  const last = anchors[anchors.length - 1];
  if (videoTime >= last.time) return last.scrollTop;

  let low = 0;
  let high = anchors.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const t = anchors[mid].time;
    if (t === videoTime) return anchors[mid].scrollTop;
    if (t < videoTime) low = mid + 1;
    else high = mid - 1;
  }

  const rightIndex = clamp(low, 1, anchors.length - 1);
  const leftIndex = rightIndex - 1;
  const left = anchors[leftIndex];
  const right = anchors[rightIndex];
  const span = Math.max(0.0001, right.time - left.time);
  const ratio = clamp((videoTime - left.time) / span, 0, 1);
  return left.scrollTop + (right.scrollTop - left.scrollTop) * ratio;
}

export function computeAdaptiveMaxSpeedPxPerSec(params: {
  contentHeight: number;
  viewportHeight: number;
  videoDuration: number;
  lineCount: number;
  seeking: boolean;
}) {
  const { contentHeight, viewportHeight, videoDuration, lineCount, seeking } = params;
  const totalScrollable = Math.max(0, contentHeight - viewportHeight);
  const duration = Math.max(1, videoDuration);
  const density = totalScrollable / duration;
  const lineFactor = 1 + Math.min(0.6, lineCount / 800);
  const base = clamp(density * 1.65 * lineFactor + 120, 140, 2200);
  if (seeking) return Math.max(base, 3200);
  return base;
}

export function smoothScrollStep(params: {
  current: number;
  target: number;
  dtSeconds: number;
  maxSpeedPxPerSec: number;
  response: number;
}) {
  const { current, target, dtSeconds, maxSpeedPxPerSec, response } = params;
  const safeDt = Math.max(1 / 240, Math.min(0.12, dtSeconds));
  const alpha = 1 - Math.exp(-Math.max(0.1, response) * safeDt);
  const desired = (target - current) * alpha;
  const maxStep = maxSpeedPxPerSec * safeDt;
  const step = clamp(desired, -maxStep, maxStep);
  const next = current + step;
  return Math.abs(target - next) < 0.1 ? target : next;
}

