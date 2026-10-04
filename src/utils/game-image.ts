const gameImages = import.meta.glob('../assets/assets/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function getGameImageUrl(apiPath: string): string {
  if (apiPath.startsWith('http://') || apiPath.startsWith('https://')) {
    return apiPath;
  }

  const fileName = apiPath.split('/').pop();

  if (!fileName) {
    return '';
  }

  const asset = Object.entries(gameImages).find(([path]) => path.endsWith(`/${fileName}`));

  return asset?.[1] ?? '';
}
