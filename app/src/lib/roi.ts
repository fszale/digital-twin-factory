export type LearningRate = "slow" | "steady" | "fast";
export type HitlIntensity = "low" | "medium" | "high";

export type ROICurvePoint = {
  month: number;
  value: number;
  isInflectionPoint: boolean;
};

export type ROIResult = {
  curve: ROICurvePoint[];
  timeTo80Percent: number | null;
  peakImprovementRate: number;
  verdict: "Accelerating" | "Stabilizing" | "Plateaued";
  midpoint: number;
};

/**
 * Simulate the rate-of-improvement curve for an agent factory deployment.
 *
 * The curve is a logistic (saturating) function of the form:
 *   V(t) = baseline + diff / (1 + e^(-k * (t - midpoint)))
 *
 * The `learningRate` controls the steepness `k` (how quickly the system
 * climbs once it gets going). The `hitlIntensity` shifts the midpoint
 * (heavier HITL takes longer to ramp up but generally produces a
 * higher-quality, slightly steeper improvement once it does).
 *
 * The verdict ("Accelerating" / "Stabilizing" / "Plateaued") describes
 * where the simulated end-of-horizon value sits on the curve relative
 * to the peak monthly improvement rate.
 */
export function simulateROICurve(
  baseline: number,
  target: number,
  months: number,
  learningRate: LearningRate,
  hitlIntensity: HitlIntensity,
): ROIResult {
  if (months < 1) {
    throw new Error("months must be at least 1");
  }

  const diff = target - baseline;
  const isIncrease = diff >= 0;
  const absDiff = Math.abs(diff);

  // Base steepness from learning rate.
  let k = 0.5;
  if (learningRate === "slow") k *= 0.4;
  if (learningRate === "fast") k *= 1.5;

  // Midpoint shifts later as HITL gets heavier; HITL also slightly
  // steepens the curve once it kicks in.
  let midpointFraction = 1 / 3;
  if (hitlIntensity === "high") {
    midpointFraction = 1 / 2;
    k *= 1.2;
  } else if (hitlIntensity === "low") {
    midpointFraction = 1 / 4;
    k *= 0.85;
  }

  // Floor the midpoint so very short horizons still sit on the
  // accelerating part of the curve at the end.
  const minMidpointMonths =
    hitlIntensity === "high" ? 4 : hitlIntensity === "medium" ? 3 : 2;
  const midpoint = Math.max(months * midpointFraction, minMidpointMonths);

  const values: number[] = [];
  for (let m = 0; m <= months; m++) {
    const progress = 1 / (1 + Math.exp(-k * (m - midpoint)));
    values.push(baseline + diff * progress);
  }

  let maxRate = 0;
  let timeTo80: number | null = null;
  for (let m = 1; m <= months; m++) {
    const rate = Math.abs(values[m] - values[m - 1]);
    if (rate > maxRate) maxRate = rate;

    const pctToTarget = absDiff === 0
      ? 1
      : isIncrease
        ? (values[m] - baseline) / absDiff
        : (baseline - values[m]) / absDiff;
    if (pctToTarget >= 0.8 && timeTo80 === null) {
      timeTo80 = m;
    }
  }

  const inflectionMonth = Math.round(midpoint);

  const curve: ROICurvePoint[] = values.map((value, m) => ({
    month: m,
    value: Number(value.toFixed(2)),
    isInflectionPoint: m === inflectionMonth,
  }));

  // Verdict from how the final-month rate compares to the peak rate.
  const finalRate =
    months >= 1 ? Math.abs(values[months] - values[months - 1]) : 0;

  let verdict: "Accelerating" | "Stabilizing" | "Plateaued" = "Accelerating";
  if (maxRate > 0) {
    const ratio = finalRate / maxRate;
    if (ratio < 0.15) {
      verdict = "Plateaued";
    } else if (ratio < 0.6) {
      verdict = "Stabilizing";
    }
  } else {
    verdict = "Plateaued";
  }

  return {
    curve,
    timeTo80Percent: timeTo80,
    peakImprovementRate: Number(maxRate.toFixed(2)),
    verdict,
    midpoint: Number(midpoint.toFixed(2)),
  };
}
