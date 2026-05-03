export type DimensionScores = {
  revenueGeneration: number;
  costSavings: number;
  riskMitigation: number;
  dataReadiness: number;
  adoptionDifficulty: number; // inverted: higher value = harder
  roiPotential: number;
};

export type ScoreVerdict = 
  | "Strong agent factory candidate"
  | "Needs more data foundation"
  | "Defer — adoption risk too high"
  | "Marginal impact — deprioritize";

export type ScoreResult = {
  compositeScore: number;
  verdict: ScoreVerdict;
  recommendations: string[];
};

export function calculateScore(scores: DimensionScores): ScoreResult {
  // Normalize adoption difficulty: inverted so lower is better (0=hard, 10=easy for score purposes)
  const normalizedAdoption = 10 - scores.adoptionDifficulty;
  
  const compositeScore = (
    scores.revenueGeneration * 1.5 +
    scores.costSavings * 1.5 +
    scores.riskMitigation * 1.0 +
    scores.dataReadiness * 2.0 +
    normalizedAdoption * 1.5 +
    scores.roiPotential * 2.5
  ) / 10; // Max possible is ~10

  let verdict: ScoreVerdict;
  let recommendations: string[] = [];

  if (scores.adoptionDifficulty > 8) {
    verdict = "Defer — adoption risk too high";
    recommendations = [
      "Break this process down into smaller sub-processes.",
      "Identify a human-in-the-loop fallback before automating.",
      "Re-evaluate when the organization has more AI familiarity."
    ];
  } else if (scores.dataReadiness < 4) {
    verdict = "Needs more data foundation";
    recommendations = [
      "Audit current data silos and APIs.",
      "Start by instrumenting the process manually.",
      "Implement structured data logging before introducing agents."
    ];
  } else if (compositeScore >= 7) {
    verdict = "Strong agent factory candidate";
    recommendations = [
      "Map out the prompt layer immediately.",
      "Deploy a shadow-mode twin to observe current workflow.",
      "Design the HITL review gate for the first 30 days."
    ];
  } else {
    verdict = "Marginal impact — deprioritize";
    recommendations = [
      "Look for processes with higher ROI potential.",
      "Consider a simple scripts/Zapier approach instead of a full agent.",
      "Bundle with other tasks to increase impact."
    ];
  }

  return {
    compositeScore: Number(compositeScore.toFixed(1)),
    verdict,
    recommendations
  };
}
