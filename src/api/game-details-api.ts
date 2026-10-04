import type { GameComment, GameComments, GameDetails, GameRecord } from '../types/game-details';

const API_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

type JsonObject = Record<string, unknown>;

export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);

    this.status = status;
    this.name = 'ApiError';
  }
}

interface GameDetailsRequestOptions {
  signal?: AbortSignal;
  userEmail?: string;
}

export async function getGameDetails(
  slug: string,
  options: GameDetailsRequestOptions = {},
): Promise<GameDetails> {
  const url = new URL(`${API_URL}/games/${encodeURIComponent(slug)}`);

  if (options.userEmail) {
    url.searchParams.set('userEmail', options.userEmail);
  }

  const raw = await requestJson(url.toString(), options.signal);

  return normalizeGameDetails(raw);
}

export async function getGameComments(slug: string, signal?: AbortSignal): Promise<GameComments> {
  const url = new URL(`${API_URL}/games/${encodeURIComponent(slug)}/comments`);

  url.searchParams.set('limit', '3');

  url.searchParams.set('sort', 'newest');

  const raw = await requestJson(url.toString(), signal);

  return normalizeComments(raw);
}

async function requestJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },

    signal,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

/*
 * GAME DETAILS NORMALIZER
 */

function normalizeGameDetails(raw: unknown): GameDetails {
  const root = asObject(raw);

  const data = asOptionalObject(root.data) ?? root;

  const specs = asOptionalObject(data.specs) ?? {};

  return {
    slug: getString(data, ['slug']),

    name: getString(data, ['name', 'title']),

    category: getString(specs, ['genre'], getString(data, ['category'])),

    price: getStringOrNumber(specs, ['price'], 'Free'),

    description: getString(data, [
      'fullDescription',
      'description',
      'longDescription',
      'shortDescription',
    ]),

    rating: getNumber(data, ['rating']),

    likesCount: getNumber(data, ['likesCount', 'likes']),

    heroImage: getString(data, ['heroImage', 'detailsImage', 'coverImage', 'cardImage']),

    players: getString(specs, ['players'], '—'),

    duration: getString(specs, ['duration'], '—'),

    topRecords: normalizeRecords(getArray(data, ['topRecords', 'records'])),

    isLikedByCurrentUser: getBoolean(data, ['isLikedByCurrentUser']),
  };
}

function normalizeRecords(values: unknown[]): GameRecord[] {
  return values.map((value, index) => {
    const record = asObject(value);

    return {
      id: getStringOrNumber(record, ['id'], String(index)),

      playerName: getString(record, ['playerName', 'name', 'player']),

      score: getNumber(record, ['score', 'points', 'totalScore']),

      createdAt: getString(record, ['createdAt', 'achievedAt', 'date'], ''),
    };
  });
}

/*
 * COMMENTS NORMALIZER
 */

function normalizeComments(raw: unknown): GameComments {
  const root = asObject(raw);

  let commentsRaw: unknown[] = [];

  let container: JsonObject = root;

  if (Array.isArray(root.data)) {
    commentsRaw = root.data;
  } else {
    const data = asOptionalObject(root.data);

    if (data) {
      container = data;

      commentsRaw = getArray(data, ['comments', 'items']);
    }
  }

  const comments = commentsRaw.map(normalizeComment);

  const rootMeta = asOptionalObject(root.meta);

  const dataMeta = asOptionalObject(container.meta);

  const meta = dataMeta ?? rootMeta ?? {};

  const totalItems = getNumber(meta, ['totalItems', 'totalCount', 'count'], comments.length);

  return {
    comments,
    totalItems,
  };
}

function normalizeComment(value: unknown): GameComment {
  const comment = asObject(value);

  return {
    id: getStringOrNumber(comment, ['id', 'commentId']),

    authorName: getAuthorName(comment),

    text: getString(comment, ['text', 'content', 'comment']),

    likesCount: getNumber(comment, ['likesCount', 'likes']),

    createdAt: getString(comment, ['createdAt', 'created', 'date']),
  };
}

/*
 * SMALL TYPE-SAFE HELPERS
 */

function asObject(value: unknown): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid API response.');
  }

  return value as JsonObject;
}

function asOptionalObject(value: unknown): JsonObject | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as JsonObject;
}

function getString(object: JsonObject, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === 'string') {
      return value;
    }
  }

  return fallback;
}

function getStringOrNumber(object: JsonObject, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }

  return fallback;
}

function getNumber(object: JsonObject, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function getBoolean(object: JsonObject, keys: string[]): boolean {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === 'boolean') {
      return value;
    }
  }

  return false;
}

function getArray(object: JsonObject, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = object[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function getAuthorName(comment: JsonObject): string {
  const direct = getString(comment, ['authorName', 'userName']);

  if (direct) {
    return direct;
  }

  if (typeof comment.author === 'string') {
    return comment.author;
  }

  const author = asOptionalObject(comment.author);

  if (author) {
    return getString(author, ['name', 'userName', 'displayName'], 'Anonymous');
  }

  return 'Anonymous';
}
