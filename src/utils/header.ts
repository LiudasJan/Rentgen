export function parseHeaders(headers: string): Record<string, string> {
  if (!headers) return {};

  return Object.fromEntries(
    headers
      .split('\n')
      .filter((h) => h.trim())
      .map((h) => {
        // If there's no colon, it's likely a curl -b flag (cookies)
        if (!h.includes(':')) {
          if (h.trim().startsWith('-b ')) return ['Cookie', h.replace('-b', '').trim()];

          // Fallback – treat as Cookie anyway
          return ['Cookie', h.trim()];
        }

        const [k, ...rest] = h.split(':');
        return [k.trim(), rest.join(':').trim()];
      }),
  );
}
