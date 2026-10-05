import type { AdminIdentity } from "./access";

type Row = { id:string; title:string; date:string; summary:string; entries_json:string; published:number; created_at:string; updated_at:string };
type Project = { id:string; name:string; excluded:number };
type Entry = { projectId:string; text:string };
type Sync = { interval_minutes:number; last_synced_at:number; manual_requested_at:number; last_run_url:string };
const intervals = new Set([15,60,360,1440]);
function json(value:unknown, status=200) { return Response.json(value,{status,headers:{"cache-control":"no-store","x-content-type-options":"nosniff"}}); }
function error(message:string,status=400) { return json({error:message},status); }
function text(value:unknown,max:number) { return typeof value==="string" ? value.trim().slice(0,max) : ""; }
function entries(raw:string):Entry[] { try { const value:unknown=JSON.parse(raw); return Array.isArray(value) ? value.filter((item):item is Entry=>!!item && typeof item.projectId==="string" && typeof item.text==="string") : []; } catch { return []; } }
function dto(row:Row) { return {id:row.id,title:row.title,date:row.date,summary:row.summary,entries:entries(row.entries_json),published:row.published===1,createdAt:row.created_at,updatedAt:row.updated_at}; }
function projectDto(row:Project) { return {...row,excluded:row.excluded===1}; }
async function body(request:Request):Promise<Record<string,unknown>|Response> {
  if(Number(request.headers.get("content-length")??0)>100000) return error("Request is too large.",413);
  try { const data:unknown=await request.json(); return data && typeof data==="object" && !Array.isArray(data) ? data as Record<string,unknown> : error("Send an object."); }
  catch { return error("Request body must be valid JSON."); }
}
async function allProjects(env:Env) { return (await env.DB.prepare("SELECT id,name,excluded FROM update_projects ORDER BY name COLLATE NOCASE").all<Project>()).results; }
async function allUpdates(env:Env,published=false) { return (await env.DB.prepare(`SELECT id,title,date,summary,entries_json,published,created_at,updated_at FROM updates ${published?"WHERE published=1":""} ORDER BY date DESC,updated_at DESC LIMIT 100`).all<Row>()).results; }
function cleanEntries(value:unknown):Entry[]|null {
  if(!Array.isArray(value)||value.length>100) return null;
  const result=value.map((item:unknown)=>{
    if(!item||typeof item!=="object") return null;
    const record=item as Record<string,unknown>, projectId=text(record.projectId,80), entryText=text(record.text,800);
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectId)&&entryText ? {projectId,text:entryText} : null;
  });
  return result.every((item):item is Entry=>item!==null) ? result : null;
}
async function saveUpdate(request:Request,env:Env,id:string|null) {
  const data=await body(request); if(data instanceof Response) return data;
  const slug=text(id??data.id,80).toLowerCase(), title=text(data.title,140), date=text(data.date,10), summary=text(data.summary,500), items=cleanEntries(data.entries), published=data.published===true;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return error("Use a lowercase, hyphenated slug.");
  if(!title||!summary) return error("Add a title and summary.");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(`${date}T00:00:00Z`).toISOString().slice(0,10)!==date) return error("Use a valid date.");
  if(!items) return error("Keep up to 100 non-empty entries, each tied to a project.");
  if(!id&&published) return error("Save the draft first, then approve it.");
  const projects=new Map((await allProjects(env)).map((project)=>[project.id,project]));
  if(items.some((item)=>!projects.has(item.projectId))) return error("Every entry needs a project from the project list.");
  if(published&&!items.some((item)=>projects.get(item.projectId)?.excluded===0)) return error("Include at least one project with an entry before publishing.");
  try {
    if(id) {
      const result=await env.DB.prepare("UPDATE updates SET title=?,date=?,summary=?,entries_json=?,published=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(title,date,summary,JSON.stringify(items),published?1:0,id).run();
      if(!result.meta.changes) return error("Update draft not found.",404);
    } else {
      await env.DB.prepare("INSERT INTO updates (id,title,date,summary,entries_json,published,created_by) VALUES (?,?,?,?,?,0,?)").bind(slug,title,date,summary,JSON.stringify(items),"admin").run();
    }
    const row=await env.DB.prepare("SELECT id,title,date,summary,entries_json,published,created_at,updated_at FROM updates WHERE id=?").bind(slug).first<Row>();
    return json({update:row?dto(row):null},id?200:201);
  } catch(caught) {
    const duplicate=caught instanceof Error&&caught.message.includes("UNIQUE constraint failed");
    console.error(JSON.stringify({event:"save_update_failed",id:slug,error:caught instanceof Error?caught.message:"unknown"}));
    return error(duplicate?"That slug already exists.":"The update could not be saved.",duplicate?409:500);
  }
}
export async function handlePublicUpdates(request:Request,env:Env):Promise<Response> {
  if(request.method!=="GET") return error("Method not allowed.",405);
  try {
    const projects=new Map((await allProjects(env)).map((project)=>[project.id,project]));
    const updates=(await allUpdates(env,true)).map((row)=>{
      const grouped=new Map<string,{id:string;name:string;bullets:string[]}>();
      for(const entry of entries(row.entries_json)) {
        const project=projects.get(entry.projectId); if(!project||project.excluded) continue;
        if(!grouped.has(project.id)) grouped.set(project.id,{id:project.id,name:project.name,bullets:[]});
        grouped.get(project.id)?.bullets.push(entry.text);
      }
      const groups=[...grouped.values()];
      return {id:row.id,title:row.title,date:row.date,summary:row.summary,projects:groups,bullets:groups.flatMap((group)=>group.bullets)};
    }).filter((update)=>update.projects.length>0);
    return json({updates});
  } catch(caught) { console.error(JSON.stringify({event:"public_updates_failed",error:caught instanceof Error?caught.message:"unknown"})); return error("Published updates could not be loaded.",500); }
}
function nextCheck(now:number) { return (Math.floor(now/900)+1)*900; }
async function syncRow(env:Env) { return env.DB.prepare("SELECT * FROM update_sync_control WHERE id=1").first<Sync>(); }
function syncDto(row:Sync,now=Math.floor(Date.now()/1000)) {
  const pending=row.manual_requested_at>row.last_synced_at;
  return {intervalMinutes:row.interval_minutes,lastSyncedAt:row.last_synced_at,manualRequestedAt:row.manual_requested_at,lastRunUrl:row.last_run_url,nextCheckAt:nextCheck(now),nextPublishAt:pending?nextCheck(now):Math.max(nextCheck(now),Math.ceil((row.last_synced_at+row.interval_minutes*60)/900)*900),due:pending||now>=row.last_synced_at+row.interval_minutes*60};
}
export async function handleSyncControl(request:Request,env:Env):Promise<Response> {
  const row=await syncRow(env); if(!row) return error("Sync settings unavailable.",500);
  if(request.method==="GET") return json(syncDto(row));
  if(request.method!=="POST") return error("Method not allowed.",405);
  const token=env.UPDATES_SYNC_TOKEN;
  if(!token||request.headers.get("x-updates-sync-token")!==token) return error("Unauthorized.",401);
  const data=await body(request); if(data instanceof Response) return data;
  const requested=Number(data.manualRequestedAt), runUrl=text(data.runUrl,300);
  if(!Number.isSafeInteger(requested)||!/^https:\/\/github\.com\/nascarjake\/jakedoesdev\/actions\/runs\/\d+$/.test(runUrl)) return error("Invalid acknowledgement.");
  await env.DB.prepare("UPDATE update_sync_control SET last_synced_at=?,last_run_url=?,manual_requested_at=CASE WHEN manual_requested_at=? THEN 0 ELSE manual_requested_at END WHERE id=1").bind(Math.floor(Date.now()/1000),runUrl,requested).run();
  return json({ok:true});
}
export async function handleAdminUpdates(request:Request,env:Env,_identity:AdminIdentity):Promise<Response> {
  const path=new URL(request.url).pathname;
  try {
    if(path==="/api/admin/updates"&&request.method==="GET") return json({updates:(await allUpdates(env)).map(dto),projects:(await allProjects(env)).map(projectDto)});
    if(path==="/api/admin/updates"&&request.method==="POST") return saveUpdate(request,env,null);
    if(path==="/api/admin/updates/projects"&&request.method==="POST") {
      const data=await body(request); if(data instanceof Response) return data;
      const id=text(data.id,80).toLowerCase(),name=text(data.name,120);
      if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||!name) return error("Add a project name and slug.");
      await env.DB.prepare("INSERT INTO update_projects (id,name,excluded) VALUES (?,?,1)").bind(id,name).run();
      return json({projects:(await allProjects(env)).map(projectDto)},201);
    }
    const project=path.match(/^\/api\/admin\/updates\/projects\/([^/]+)$/);
    if(project&&request.method==="PUT") {
      const data=await body(request); if(data instanceof Response) return data;
      const name=text(data.name,120); if(!name||typeof data.excluded!=="boolean") return error("Add a name and exclusion setting.");
      const result=await env.DB.prepare("UPDATE update_projects SET name=?,excluded=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(name,data.excluded?1:0,decodeURIComponent(project[1])).run();
      return result.meta.changes?json({projects:(await allProjects(env)).map(projectDto)}):error("Project not found.",404);
    }
    if(path==="/api/admin/updates/sync"&&request.method==="GET") return json(syncDto((await syncRow(env))!));
    if(path==="/api/admin/updates/sync"&&request.method==="PUT") {
      const data=await body(request); if(data instanceof Response) return data;
      const minutes=Number(data.intervalMinutes); if(!intervals.has(minutes)) return error("Choose 15 minutes, hourly, every 6 hours, or daily.");
      await env.DB.prepare("UPDATE update_sync_control SET interval_minutes=? WHERE id=1").bind(minutes).run();
      return json(syncDto((await syncRow(env))!));
    }
    if(path==="/api/admin/updates/sync/request"&&request.method==="POST") {
      const current=await syncRow(env);
      const requestAt=Math.max(Math.floor(Date.now()/1000), (current?.last_synced_at??0)+1, (current?.manual_requested_at??0)+1);
      await env.DB.prepare("UPDATE update_sync_control SET manual_requested_at=? WHERE id=1").bind(requestAt).run();
      return json(syncDto((await syncRow(env))!));
    }
    const update=path.match(/^\/api\/admin\/updates\/([^/]+)$/);
    if(update&&request.method==="PUT") return saveUpdate(request,env,decodeURIComponent(update[1]));
    if(update&&request.method==="DELETE") {
      const result=await env.DB.prepare("DELETE FROM updates WHERE id=? AND published=0").bind(decodeURIComponent(update[1])).run();
      return result.meta.changes?json({deleted:true}):error("Only unpublished drafts can be deleted.",409);
    }
    return error("Update admin endpoint not found.",404);
  } catch(caught) { console.error(JSON.stringify({event:"admin_updates_failed",path,error:caught instanceof Error?caught.message:"unknown"})); return error("The update request could not be completed.",500); }
}
