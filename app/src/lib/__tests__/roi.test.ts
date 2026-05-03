import { simulateROICurve, ROICurvePoint, ROIResult } from '../roi';

describe('simulateROICurve', () => {
  it('generates a monotonic curve reaching target', () => {
    const result = simulateROICurve(100, 200, 12, 'steady', 'medium');
    expect(result.curve.length).toBe(13);
    
    // Monotonic increase
    for (let i = 1; i < result.curve.length; i++) {
      expect(result.curve[i].value).toBeGreaterThanOrEqual(result.curve[i-1].value);
    }
    
    // Approaches target
    expect(result.curve[12].value).toBeCloseTo(200, -1); // within ~10 units
  });

  it('detects 80% threshold', () => {
    const result = simulateROICurve(0, 100, 24, 'fast', 'low');
    expect(result.timeTo80Percent).toBeDefined();
    expect(result.timeTo80Percent).toBeGreaterThan(0);
    expect(result.curve[result.timeTo80Percent!].value).toBeGreaterThanOrEqual(80);
  });

  it('classifies Plateaued when growth stops', () => {
    const result = simulateROICurve(0, 100, 48, 'fast', 'low');
    expect(result.verdict).toBe('Plateaued');
  });

  it('classifies Accelerating early in the curve', () => {
    const result = simulateROICurve(0, 100, 6, 'slow', 'high');
    expect(result.verdict).toBe('Accelerating');
  });

  it('handles decreases', () => {
    const result = simulateROICurve(100, 50, 12, 'steady', 'medium');
    
    // Monotonic decrease
    for (let i = 1; i < result.curve.length; i++) {
      expect(result.curve[i].value).toBeLessThanOrEqual(result.curve[i-1].value);
    }
  });

  it('marks one inflection point on the curve', () => {
    const result = simulateROICurve(0, 100, 12, 'steady', 'medium');
    const inflections = result.curve.filter((p) => p.isInflectionPoint);
    expect(inflections.length).toBe(1);
  });

  it('high HITL pushes the inflection point later than low HITL', () => {
    const high = simulateROICurve(0, 100, 24, 'steady', 'high');
    const low = simulateROICurve(0, 100, 24, 'steady', 'low');
    expect(high.midpoint).toBeGreaterThan(low.midpoint);
  });

  it('throws on a non-positive horizon', () => {
    expect(() => simulateROICurve(0, 100, 0, 'steady', 'medium')).toThrow();
  });
});
