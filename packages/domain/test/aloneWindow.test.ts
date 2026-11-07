// PS-012 alone-window warning, using the O3 wireframe example.
import { describe, expect, it } from 'vitest';
import { ist, longestAloneWindow } from '../src';

const at = (h: number, m = 0) => ist(2026, 11, 9, h, m);

describe('alone window (PS-012)', () => {
  it('O3 example: out 9-7, visit at 1 pm -> never alone more than 6 hours', () => {
    const r = longestAloneWindow(at(9), at(19), [at(13)]);
    expect(r).toMatchObject({ longestMinutes: 360, exceeds: false });
    expect(r.from).toEqual(at(13));
  });

  it('warns when no visit splits a long absence', () => {
    expect(longestAloneWindow(at(9), at(19), []).exceeds).toBe(true);
  });

  it('ignores visits outside the absence and handles unsorted input', () => {
    const r = longestAloneWindow(at(9), at(19), [at(16), at(8), at(12)]);
    expect(r.longestMinutes).toBe(240); // 12 pm to 4 pm
  });

  it('rejects a return before leaving', () => {
    expect(() => longestAloneWindow(at(19), at(9), [])).toThrow();
  });
});
