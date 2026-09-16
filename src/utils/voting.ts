export const COFFEE_VOTE = '☕';
export const UNKNOWN_VOTE = '?';
export const FIBONACCI_VOTES = [1, 2, 3, 5, 8, 13, 21] as const;
export const VALID_VOTES = [...FIBONACCI_VOTES, UNKNOWN_VOTE, COFFEE_VOTE] as const;

export type VoteValue = (typeof VALID_VOTES)[number];

export type VoteRecord = {
  value?: VoteValue;
};

export type VoteStats = {
  min: number;
  max: number;
  avg: number;
  mode: number;
};

export function isValidVote(value: unknown): value is VoteValue {
  return VALID_VOTES.includes(value as VoteValue);
}

export function calculateVoteStats(votes: Record<string, VoteRecord>): VoteStats | null {
  const values = Object.values(votes)
    .map((vote) => Number(vote.value))
    .filter((value) => !Number.isNaN(value));

  if (!values.length) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2));
  const counts = values.reduce<Record<number, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  const mode = Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);

  return { min, max, avg, mode };
}
