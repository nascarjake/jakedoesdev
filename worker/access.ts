type AccessJwtHeader = { alg?: string; kid?: string };
type AccessJwtPayload = {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iss?: string;
  nbf?: number;
  type?: string;
};

type JsonWebKeyWithKid = JsonWebKey & { kid?: string };

export type AdminIdentity = { email: string };

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = atob(padded);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
}

function configuredAdmins(env: Env): Set<string> {
  return new Set(
    env.ADMIN_EMAILS.split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function getSigningKey(
  env: Env,
  keyId: string,
  ctx: ExecutionContext,
): Promise<JsonWebKeyWithKid | null> {
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  if (!teamDomain) return null;

  const certsUrl = `https://${teamDomain}/cdn-cgi/access/certs`;
  const cacheKey = new Request(certsUrl, { method: "GET" });
  const cache = await caches.open("cloudflare-access-jwks");
  let response = await cache.match(cacheKey);
  if (!response) {
    response = await fetch(cacheKey);
    if (!response.ok) return null;
    const cached = new Response(response.clone().body, response);
    cached.headers.set("cache-control", "public, max-age=3600");
    ctx.waitUntil(cache.put(cacheKey, cached));
  }

  const body = (await response.json()) as { keys?: JsonWebKeyWithKid[] };
  return body.keys?.find((key) => key.kid === keyId) ?? null;
}

export async function authenticateAdmin(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<AdminIdentity | null> {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) return null;

  const pieces = token.split(".");
  if (pieces.length !== 3) return null;

  try {
    const header = decodeJson<AccessJwtHeader>(pieces[0]);
    const payload = decodeJson<AccessJwtPayload>(pieces[1]);
    if (header.alg !== "RS256" || !header.kid || !payload.email) return null;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= now || (payload.nbf && payload.nbf > now)) {
      return null;
    }

    const teamDomain = env.CF_ACCESS_TEAM_DOMAIN.trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");
    if (payload.iss !== `https://${teamDomain}` || payload.type !== "app") return null;

    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!audiences.includes(env.CF_ACCESS_AUD)) return null;

    const signingKey = await getSigningKey(env, header.kid, ctx);
    if (!signingKey) return null;
    const key = await crypto.subtle.importKey(
      "jwk",
      signingKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const signatureBytes = decodeBase64Url(pieces[2]);
    const signature = signatureBytes.buffer.slice(
      signatureBytes.byteOffset,
      signatureBytes.byteOffset + signatureBytes.byteLength,
    ) as ArrayBuffer;
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      signature,
      new TextEncoder().encode(`${pieces[0]}.${pieces[1]}`),
    );
    if (!valid) return null;

    const email = payload.email.trim().toLowerCase();
    if (!configuredAdmins(env).has(email)) return null;
    return { email };
  } catch {
    return null;
  }
}

export function isValidAdminWrite(request: Request): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  const origin = request.headers.get("origin");
  return (
    origin === new URL(request.url).origin &&
    request.headers.get("x-portfolio-admin") === "1"
  );
}
