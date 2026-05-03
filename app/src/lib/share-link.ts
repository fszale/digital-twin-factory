import { DimensionScores } from './scoring';

export function encodeScoresToUrl(scores: DimensionScores, processName: string, description: string, department: string): string {
  const params = new URLSearchParams();
  params.set('rg', scores.revenueGeneration.toString());
  params.set('cs', scores.costSavings.toString());
  params.set('rm', scores.riskMitigation.toString());
  params.set('dr', scores.dataReadiness.toString());
  params.set('ad', scores.adoptionDifficulty.toString());
  params.set('roi', scores.roiPotential.toString());
  
  if (processName) params.set('n', processName);
  if (description) params.set('d', description);
  if (department) params.set('dep', department);
  
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function decodeScoresFromUrl(searchParams: URLSearchParams): { scores: DimensionScores | null, processName: string, description: string, department: string } {
  const rg = searchParams.get('rg');
  const cs = searchParams.get('cs');
  const rm = searchParams.get('rm');
  const dr = searchParams.get('dr');
  const ad = searchParams.get('ad');
  const roi = searchParams.get('roi');

  const processName = searchParams.get('n') || '';
  const description = searchParams.get('d') || '';
  const department = searchParams.get('dep') || '';

  if (rg && cs && rm && dr && ad && roi) {
    return {
      scores: {
        revenueGeneration: parseInt(rg, 10),
        costSavings: parseInt(cs, 10),
        riskMitigation: parseInt(rm, 10),
        dataReadiness: parseInt(dr, 10),
        adoptionDifficulty: parseInt(ad, 10),
        roiPotential: parseInt(roi, 10),
      },
      processName,
      description,
      department
    };
  }

  return { scores: null, processName, description, department };
}
