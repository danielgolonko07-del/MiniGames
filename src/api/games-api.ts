import type { Game, GamesResponse } from '../types/game';

const API_URL =
  'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

const API_ORIGIN =
  'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

export async function getFeaturedGames(): Promise<Game[]> {
  const response = await fetch(`${API_URL}/games?featured=true`);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const result = (await response.json()) as GamesResponse;

  return result.data;
}

export function getGameImageUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return new URL(path, API_ORIGIN).href;
}