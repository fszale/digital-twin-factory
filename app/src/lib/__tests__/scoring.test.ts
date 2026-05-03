import { calculateScore, DimensionScores } from '../scoring';

describe('calculateScore', () => {
  it('returns perfect score for ideal candidate', () => {
    const scores: DimensionScores = {
      revenueGeneration: 10,
      costSavings: 10,
      riskMitigation: 10,
      dataReadiness: 10,
      adoptionDifficulty: 0,
      roiPotential: 10,
    };
    const result = calculateScore(scores);
    expect(result.compositeScore).toBe(10);
    expect(result.verdict).toBe("Strong agent factory candidate");
  });

  it('returns zero score for worst candidate', () => {
    const scores: DimensionScores = {
      revenueGeneration: 0,
      costSavings: 0,
      riskMitigation: 0,
      dataReadiness: 0,
      adoptionDifficulty: 10,
      roiPotential: 0,
    };
    const result = calculateScore(scores);
    expect(result.compositeScore).toBe(0);
    expect(result.verdict).toBe("Defer — adoption risk too high");
  });

  it('detects high adoption risk', () => {
    const scores: DimensionScores = {
      revenueGeneration: 8,
      costSavings: 8,
      riskMitigation: 8,
      dataReadiness: 8,
      adoptionDifficulty: 9,
      roiPotential: 8,
    };
    const result = calculateScore(scores);
    expect(result.verdict).toBe("Defer — adoption risk too high");
  });

  it('detects poor data readiness', () => {
    const scores: DimensionScores = {
      revenueGeneration: 8,
      costSavings: 8,
      riskMitigation: 8,
      dataReadiness: 3,
      adoptionDifficulty: 4,
      roiPotential: 8,
    };
    const result = calculateScore(scores);
    expect(result.verdict).toBe("Needs more data foundation");
  });

  it('identifies marginal impact', () => {
    const scores: DimensionScores = {
      revenueGeneration: 3,
      costSavings: 3,
      riskMitigation: 3,
      dataReadiness: 5,
      adoptionDifficulty: 4,
      roiPotential: 3,
    };
    const result = calculateScore(scores);
    expect(result.verdict).toBe("Marginal impact — deprioritize");
  });

  it('returns recommendations for every verdict', () => {
    const scores: DimensionScores = {
      revenueGeneration: 5,
      costSavings: 5,
      riskMitigation: 5,
      dataReadiness: 5,
      adoptionDifficulty: 5,
      roiPotential: 5,
    };
    const result = calculateScore(scores);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2);
    expect(result.recommendations.every((r) => r.length > 0)).toBe(true);
  });

  it('adoption difficulty gate fires before low data readiness', () => {
    const scores: DimensionScores = {
      revenueGeneration: 8,
      costSavings: 8,
      riskMitigation: 8,
      dataReadiness: 1,
      adoptionDifficulty: 10,
      roiPotential: 8,
    };
    const result = calculateScore(scores);
    expect(result.verdict).toBe("Defer — adoption risk too high");
  });
});
