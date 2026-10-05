/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { authenticateAdmin, isValidAdminWrite } from "./access";
import { handleAdminGamesApi, handleGameMedia, handlePublicGames } from "./games-api";
import { handleAdminApi, handleProjectMedia, handlePublicProjects } from "./projects-api";
import { handleAdminUpdates, handlePublicUpdates, handleSyncControl } from "./updates-api";

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/games") {
      return handlePublicGames(request, env);
    }

    if (url.pathname.startsWith("/api/games/media/")) {
      return handleGameMedia(request, env);
    }

    if (url.pathname === "/api/projects") {
      return handlePublicProjects(request, env);
    }

    if (url.pathname === "/api/updates") {
      const response = await handlePublicUpdates(request, env);
      if (response.ok) response.headers.set("cache-control", "public, max-age=60, stale-while-revalidate=300");
      return response;
    }

    if (url.pathname === "/api/updates/sync-control") {
      return handleSyncControl(request, env);
    }

    if (url.pathname.startsWith("/api/media/")) {
      return handleProjectMedia(request, env);
    }

    if (url.pathname.startsWith("/api/admin/")) {
      const identity = await authenticateAdmin(request, env, ctx);
      if (!identity) {
        return Response.json(
          { error: "Cloudflare Access authentication is required." },
          { status: 401, headers: { "cache-control": "no-store" } },
        );
      }
      if (!isValidAdminWrite(request)) {
        return Response.json(
          { error: "The request origin could not be verified." },
          { status: 403, headers: { "cache-control": "no-store" } },
        );
      }
      const isGamesAdminRoute =
        url.pathname === "/api/admin/games" ||
        url.pathname.startsWith("/api/admin/games/") ||
        url.pathname.startsWith("/api/admin/game-revisions/");
      const response = isGamesAdminRoute
        ? await handleAdminGamesApi(request, env, identity)
        : url.pathname.startsWith("/api/admin/updates")
          ? await handleAdminUpdates(request, env, identity)
          : await handleAdminApi(request, env, identity);
      response.headers.set("cache-control", "no-store");
      return response;
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format: format as "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "image/avif", quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      const secured = new Response(response.body, response);
      secured.headers.set("cache-control", "no-store");
      secured.headers.set("content-security-policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
      secured.headers.set("referrer-policy", "no-referrer");
      secured.headers.set("x-frame-options", "DENY");
      return secured;
    }
    return response;
  },
};

export default worker;
