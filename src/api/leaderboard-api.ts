import type { LeaderboardResponse } from '../types/leaderboard';

const API_URL =
  'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  const response = await fetch(`${API_URL}/leaderboard`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load leaderboard: ${response.status}`,
    );
  }

  const result =
    (await response.json()) as LeaderboardResponse;

  if (!Array.isArray(result.data)) {
    throw new Error('Invalid leaderboard response');
  }

  return result;
}