const redirectedScreenshots = new Set([
  "/projects/stream-dj/studio.webp/",
  "/projects/stream-dj/programming.webp/",
  "/projects/markdown-podcast-studio/studio.webp/",
]);

// While the assets were absent, the app's trailingSlash redirect was cached by
// browsers. Serve the original bytes at those exact legacy targets: redirecting
// back would loop through the browser's cached permanent redirect.
export function handleRedirectedDesktopScreenshot(request: Request, env: Env): Promise<Response> | null {
  const url = new URL(request.url);
  if (!redirectedScreenshots.has(url.pathname) || !["GET", "HEAD"].includes(request.method)) return null;
  url.pathname = url.pathname.slice(0, -1);
  return env.ASSETS.fetch(new Request(url, request));
}
