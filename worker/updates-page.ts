import { handlePublicUpdates } from "./updates-api";

type Published = {
  id: string;
  title: string;
  date: string;
  summary: string;
  projects: { id: string; name: string; bullets: string[] }[];
};

function escape(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

export async function handleUpdatePage(request: Request, env: Env, slug: string): Promise<Response> {
  const response = await handlePublicUpdates(request, env);
  if (!response.ok) return new Response("Published notes are unavailable.", { status: 503 });
  const payload = await response.json() as { updates: Published[] };
  const update = payload.updates.find((item) => item.id === slug);
  if (!update) return new Response("Note not found.", { status: 404 });
  const groups = update.projects.map((project) => `<section class="project"><h2>${escape(project.name)}</h2><ul>${project.bullets.map((bullet) => `<li>${escape(bullet)}</li>`).join("")}</ul></section>`).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(update.title)} | Jacob Clark</title><meta name="description" content="${escape(update.summary)}"><style>
    :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#ebe8e1;color:#202838;font-family:Arial,Helvetica,sans-serif}a{color:inherit}
    .top{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px clamp(20px,4vw,60px);border-bottom:1px solid #d2cec6}
    .brand{display:flex;align-items:center;gap:13px;text-decoration:none;font-weight:800;letter-spacing:.08em;font-size:13px}.mark{display:grid;place-items:center;width:52px;height:52px;border-radius:7px;background:#202838;color:#f4eee5;font-weight:900;font-size:20px;letter-spacing:-.08em}
    nav{display:flex;gap:25px;flex-wrap:wrap;font-size:14px;font-weight:700}nav a{text-decoration:none}nav a:hover,.back:hover{color:#cb5a40}
    main{max-width:1250px;margin:30px auto;padding:0 clamp(16px,3vw,36px)}.paper{min-height:70vh;background:#f8f5ed;border:1px solid #d3cec4;border-radius:8px;overflow:hidden}
    .crumb{padding:23px 32px;border-bottom:1px solid #d3cec4;color:#666e77;font:12px ui-monospace,SFMono-Regular,monospace}
    article{max-width:850px;padding:clamp(28px,5vw,70px)}.eyebrow{color:#ab6d55;text-transform:uppercase;letter-spacing:.13em;font:700 11px ui-monospace,SFMono-Regular,monospace}
    h1{font-size:clamp(36px,5vw,65px);line-height:1.08;letter-spacing:-.04em;margin:17px 0 20px}.summary{color:#697077;font-size:18px;line-height:1.65;margin-bottom:48px}
    .project{border-top:1px solid #d3cec4;padding:22px 0 8px}.project h2{font-size:23px;margin:8px 0 18px}.project ul{padding-left:23px;color:#4e5660;font-size:16px;line-height:1.8}.project li{margin-bottom:10px}.project li::marker{color:#cb5a40}
    .back{display:inline-block;margin-top:35px;font-size:13px;font-weight:700;text-decoration:none}@media(max-width:600px){.top{align-items:flex-start;flex-direction:column}.crumb{padding:18px}nav{gap:16px}}
  </style></head><body><header class="top"><a class="brand" href="/"><span class="mark">jc.</span><span>JACOB CLARK</span></a><nav aria-label="Main navigation"><a href="/universe/">Workbench</a><a href="/resume/">About me</a><a href="/updates/" aria-current="page">Field notes</a></nav></header><main><div class="paper"><div class="crumb">Workbench / Field notes</div><article><p class="eyebrow">${escape(update.date)}</p><h1>${escape(update.title)}</h1><p class="summary">${escape(update.summary)}</p>${groups}<a class="back" href="/updates/">← All field notes</a></article></div></main></body></html>`;
  return new Response(html, { headers: {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    "x-content-type-options": "nosniff",
  } });
}
