import { describe, it, expect } from 'vitest';
import { getSvgPathFromStroke } from '../src/ink/svg-path';

describe('getSvgPathFromStroke', () => {
  it('returns empty string for 0 points', () => {
    expect(getSvgPathFromStroke([])).toBe('');
  });

  it('renders a valid path for 1 point (dot)', () => {
    const path = getSvgPathFromStroke([[10, 20]]);
    expect(path).toContain('M 9.50 20.00 a 0.5 0.5');
  });

  it('renders a line for 2 points', () => {
    const path = getSvgPathFromStroke([[0, 0], [10, 10]], true);
    expect(path).toBe('M 0.00,0.00 L 10.00,10.00 Z');
  });

  it('renders a triangle for 3 points', () => {
    const path = getSvgPathFromStroke([[0, 0], [10, 0], [5, 10]], true);
    expect(path).toBe('M 0.00,0.00 L 10.00,0.00 L 5.00,10.00 Z');
  });

  it('renders a smooth curve for 4 or more points', () => {
    const path = getSvgPathFromStroke([[0, 0], [10, 5], [20, 10], [30, 15]], true);
    expect(path.startsWith('M0.00,0.00 Q10.00,5.00')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
  });
});
