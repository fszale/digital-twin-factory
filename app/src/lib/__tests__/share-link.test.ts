import { encodeScoresToUrl, decodeScoresFromUrl } from '../share-link';
import { DimensionScores } from '../scoring';

describe('share-link URL utilities', () => {
  let originalWindow: any;

  beforeAll(() => {
    originalWindow = global.window;
    const location = {
      origin: 'http://localhost:3000',
      pathname: '/scorer',
    };
    Object.defineProperty(global, 'window', {
      value: { location },
      writable: true
    });
  });

  afterAll(() => {
    global.window = originalWindow;
  });

  it('encodes scores to a valid URL', () => {
    const scores: DimensionScores = {
      revenueGeneration: 8,
      costSavings: 7,
      riskMitigation: 6,
      dataReadiness: 5,
      adoptionDifficulty: 4,
      roiPotential: 9,
    };
    
    const url = encodeScoresToUrl(scores, "Invoice Processing", "Automating vendor invoices", "finance");
    
    expect(url).toContain('http://localhost:3000/scorer?');
    expect(url).toContain('rg=8');
    expect(url).toContain('cs=7');
    expect(url).toContain('rm=6');
    expect(url).toContain('dr=5');
    expect(url).toContain('ad=4');
    expect(url).toContain('roi=9');
    expect(url).toContain('n=Invoice+Processing');
    expect(url).toContain('dep=finance');
  });

  it('decodes scores from URL search params', () => {
    const params = new URLSearchParams('rg=8&cs=7&rm=6&dr=5&ad=4&roi=9&n=Invoice+Processing&dep=finance');
    
    const result = decodeScoresFromUrl(params);
    
    expect(result.scores).not.toBeNull();
    expect(result.scores?.revenueGeneration).toBe(8);
    expect(result.scores?.costSavings).toBe(7);
    expect(result.scores?.adoptionDifficulty).toBe(4);
    
    expect(result.processName).toBe('Invoice Processing');
    expect(result.department).toBe('finance');
  });

  it('returns null scores if params are missing', () => {
    const params = new URLSearchParams('rg=8&cs=7'); // Missing rm, dr, ad, roi
    
    const result = decodeScoresFromUrl(params);
    
    expect(result.scores).toBeNull();
  });

  it('round-trips encode → decode without loss', () => {
    const scores: DimensionScores = {
      revenueGeneration: 9,
      costSavings: 6,
      riskMitigation: 5,
      dataReadiness: 8,
      adoptionDifficulty: 3,
      roiPotential: 7,
    };
    const url = encodeScoresToUrl(scores, "PR Triage", "Auto-route incoming PRs", "engineering");
    const params = new URLSearchParams(url.split('?')[1]);
    const decoded = decodeScoresFromUrl(params);
    expect(decoded.scores).toEqual(scores);
    expect(decoded.processName).toBe("PR Triage");
    expect(decoded.description).toBe("Auto-route incoming PRs");
    expect(decoded.department).toBe("engineering");
  });

  it('omits process metadata when fields are empty', () => {
    const scores: DimensionScores = {
      revenueGeneration: 5,
      costSavings: 5,
      riskMitigation: 5,
      dataReadiness: 5,
      adoptionDifficulty: 5,
      roiPotential: 5,
    };
    const url = encodeScoresToUrl(scores, "", "", "");
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.has('n')).toBe(false);
    expect(params.has('d')).toBe(false);
    expect(params.has('dep')).toBe(false);
  });
});
