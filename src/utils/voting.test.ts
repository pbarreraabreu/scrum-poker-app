import { describe, expect, it } from 'vitest';
import { COFFEE_VOTE, calculateVoteStats, isValidVote } from './voting';

describe('voting utilities', () => {
  it('accepts valid Fibonacci, unknown, and coffee votes', () => {
    expect(isValidVote(1)).toBe(true);
    expect(isValidVote(21)).toBe(true);
    expect(isValidVote('?')).toBe(true);
    expect(isValidVote(COFFEE_VOTE)).toBe(true);
  });

  it('rejects unsupported votes', () => {
    expect(isValidVote(34)).toBe(false);
    expect(isValidVote('coffee')).toBe(false);
    expect(isValidVote(null)).toBe(false);
  });

  it('calculates numeric result statistics and ignores non-numeric votes', () => {
    expect(calculateVoteStats({
      a: { value: 3 },
      b: { value: 5 },
      c: { value: 5 },
      d: { value: '?' },
      e: { value: COFFEE_VOTE },
    })).toEqual({ min: 3, max: 5, avg: 4.33, mode: 5 });
  });

  it('returns null when no numeric votes exist', () => {
    expect(calculateVoteStats({
      a: { value: '?' },
      b: { value: COFFEE_VOTE },
    })).toBeNull();
  });
});
