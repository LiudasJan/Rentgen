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

export function hasQueryParameters(url: string): boolean {
  try {
    return new URL(url).searchParams.toString().length > 0;
  } catch {
    return false;
  }
}

export function uppercaseDomain(url: string): string {
  const parsedUrl = new URL(url);
  const uppercaseHostname = parsedUrl.hostname.toUpperCase();
  const protocol = parsedUrl.protocol;
  const port = parsedUrl.port ? `:${parsedUrl.port}` : '';
  const pathname = parsedUrl.pathname;
  const search = parsedUrl.search;
  const hash = parsedUrl.hash;

  return `${protocol}//${uppercaseHostname}${port}${pathname}${search}${hash}`;
}

export function uppercasePath(url: string): string {
  const parsedUrl = new URL(url);
  parsedUrl.pathname = parsedUrl.pathname.toUpperCase();

  return parsedUrl.toString();
}
