export function websocketUrl(path: string, apiBase: string, documentBase: string): string {
  // Resolve against the application's base tag, never the current router path.
  const base = new URL(apiBase || './', documentBase);
  const url = new URL(path, base);
  if (url.protocol === 'https:') {
    url.protocol = 'wss:';
  } else if (url.protocol === 'http:') {
    url.protocol = 'ws:';
  }
  return url.href;
}
