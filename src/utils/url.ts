export function extractQueryParameters(url: string): Record<string, string> {
  try {
    const parsedUrl = new URL(url);
    const params: Record<string, string> = {};

    parsedUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch {
    return {};
  }
}
