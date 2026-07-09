export type DownscaleComparisonMetric = {
  name:
    | "meanAbsChannelDiff"
    | "maxAbsChannelDiff"
    | "meanDeltaEProxy"
    | "maxDeltaEProxy"
    | "edgeRetentionProxy"
    | "detailRetentionProxy"
    | "alphaDiffProxy";
  value: number;
  unit: "byte" | "ratio" | "proxy";
  metricLocalOnly: true;
};

function channelLuma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function absAt(data: Uint8Array, index: number): number {
  return Math.abs(data[index] ?? 0);
}

function meanNeighborContrast(data: Uint8Array, width: number, height: number): number {
  if (width < 2 || height < 2) return 0;
  let sum = 0;
  let count = 0;
  for (let y = 1; y < height; y++) {
    for (let x = 1; x < width; x++) {
      const i = (y * width + x) * 4;
      const lx = ((y * width + x - 1) * 4);
      const ly = (((y - 1) * width + x) * 4);
      const a = channelLuma(data[i], data[i + 1], data[i + 2]);
      const bx = channelLuma(data[lx], data[lx + 1], data[lx + 2]);
      const by = channelLuma(data[ly], data[ly + 1], data[ly + 2]);
      sum += Math.abs(a - bx) + Math.abs(a - by);
      count += 2;
    }
  }
  return count > 0 ? sum / count : 0;
}

function edgeProxyRatio(baseline: Uint8Array, candidate: Uint8Array, width: number, height: number): number {
  const base = meanNeighborContrast(baseline, width, height);
  const cand = meanNeighborContrast(candidate, width, height);
  return base > 0 ? cand / base : cand === 0 ? 1 : Number.POSITIVE_INFINITY;
}

export function computeDownscaleComparisonMetrics(args: {
  baseline: Uint8Array;
  candidate: Uint8Array;
  width: number;
  height: number;
  compareDeltaE: boolean;
  compareEdgeProxy: boolean;
  compareDetailProxy: boolean;
  compareByteStats: boolean;
}): DownscaleComparisonMetric[] {
  if (args.baseline.length !== args.candidate.length) {
    throw new Error("TDT-PHOTOSEAL-03-R2 metric comparison requires equal output lengths.");
  }

  const metrics: DownscaleComparisonMetric[] = [];
  let absSum = 0;
  let maxAbs = 0;
  let alphaAbsSum = 0;
  let deltaProxySum = 0;
  let deltaProxyMax = 0;
  const pixels = Math.max(1, args.width * args.height);

  for (let i = 0; i < args.baseline.length; i += 4) {
    const dr = absAt(args.candidate, i) - absAt(args.baseline, i);
    const dg = absAt(args.candidate, i + 1) - absAt(args.baseline, i + 1);
    const db = absAt(args.candidate, i + 2) - absAt(args.baseline, i + 2);
    const da = absAt(args.candidate, i + 3) - absAt(args.baseline, i + 3);
    const ar = Math.abs(dr);
    const ag = Math.abs(dg);
    const ab = Math.abs(db);
    const aa = Math.abs(da);
    absSum += ar + ag + ab;
    maxAbs = Math.max(maxAbs, ar, ag, ab, aa);
    alphaAbsSum += aa;
    const proxy = Math.sqrt(dr * dr + dg * dg + db * db) / 255;
    deltaProxySum += proxy;
    deltaProxyMax = Math.max(deltaProxyMax, proxy);
  }

  if (args.compareByteStats) {
    metrics.push({ name: "meanAbsChannelDiff", value: absSum / (pixels * 3), unit: "byte", metricLocalOnly: true });
    metrics.push({ name: "maxAbsChannelDiff", value: maxAbs, unit: "byte", metricLocalOnly: true });
    metrics.push({ name: "alphaDiffProxy", value: alphaAbsSum / pixels, unit: "byte", metricLocalOnly: true });
  }
  if (args.compareDeltaE) {
    metrics.push({ name: "meanDeltaEProxy", value: deltaProxySum / pixels, unit: "proxy", metricLocalOnly: true });
    metrics.push({ name: "maxDeltaEProxy", value: deltaProxyMax, unit: "proxy", metricLocalOnly: true });
  }
  if (args.compareEdgeProxy) {
    metrics.push({ name: "edgeRetentionProxy", value: edgeProxyRatio(args.baseline, args.candidate, args.width, args.height), unit: "ratio", metricLocalOnly: true });
  }
  if (args.compareDetailProxy) {
    metrics.push({ name: "detailRetentionProxy", value: edgeProxyRatio(args.baseline, args.candidate, args.width, args.height), unit: "ratio", metricLocalOnly: true });
  }
  return metrics;
}
