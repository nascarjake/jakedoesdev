"use client";

import { useEffect, useMemo, useState } from "react";
import { UpdateCards, type PublishedUpdate } from "../UpdatesFeed";
import styles from "./AdminPanel.module.css";

type Entry = { projectId: string; text: string };
type Draft = { id:string; title:string; date:string; summary:string; entries:Entry[]; published:boolean; updatedAt:string };
type Project = { id:string; name:string; excluded:boolean };
type Sync = { intervalMinutes:number; lastSyncedAt:number; manualRequestedAt:number; lastRunUrl:string; nextCheckAt:number; nextPublishAt:number; due:boolean };
type Notice = { type:"error"|"success"; text:string };
type Tab = "review"|"projects"|"sync";

async function api<T>(path:string,init?:RequestInit):Promise<T> {
  const response=await fetch(path,{...init,headers:{"x-portfolio-admin":"1","content-type":"application/json",...init?.headers},cache:"no-store"});
  const data=await response.json().catch(()=>({})) as {error?:string}&T;
  if(!response.ok) throw new Error(data.error??`Request failed (${response.status})`);
  return data;
}
function slug(value:string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,76); }
function fresh():Draft { const date=new Date().toISOString().slice(0,10); return {id:`field-notes-${date}-${crypto.randomUUID().slice(0,8)}`,title:"Field notes",date,summary:"",entries:[],published:false,updatedAt:""}; }
function dateTime(seconds:number) { return seconds ? new Date(seconds*1000).toLocaleString() : "Not yet"; }

export function UpdatesStudio() {
  const [tab,setTab]=useState<Tab>("review");
  const [updates,setUpdates]=useState<Draft[]>([]);
  const [projects,setProjects]=useState<Project[]>([]);
  const [selected,setSelected]=useState<Draft|null>(null);
  const [sync,setSync]=useState<Sync|null>(null);
  const [email,setEmail]=useState("");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState<Notice|null>(null);
  const [newProject,setNewProject]=useState("");
  useEffect(()=>{
    let active=true;
    void Promise.all([
      api<{user:{email:string}}>("/api/admin/session"),
      api<{updates:Draft[];projects:Project[]}>("/api/admin/updates"),
      api<Sync>("/api/admin/updates/sync"),
    ]).then(([session,data,schedule])=>{
      if(!active)return;
      setEmail(session.user.email);setUpdates(data.updates);setProjects(data.projects);setSelected(data.updates[0]??null);setSync(schedule);
    }).catch((caught)=>{if(active)setNotice({type:"error",text:caught instanceof Error?caught.message:"Could not load update review."});})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    const timer=window.setInterval(()=>{void api<Sync>("/api/admin/updates/sync").then(setSync).catch(()=>{});},60_000);
    return ()=>window.clearInterval(timer);
  },[]);
  const dirty=useMemo(()=>selected?JSON.stringify(selected)!==JSON.stringify(updates.find((item)=>item.id===selected.id)):false,[selected,updates]);
  const choose=(draft:Draft)=>{
    if(dirty&&!window.confirm("Discard unsaved changes?"))return;
    setSelected({...draft,entries:draft.entries.map((entry)=>({...entry}))});setTab("review");setNotice(null);
  };
  const create=()=>{if(dirty&&!window.confirm("Discard unsaved changes?"))return;setSelected(fresh());setTab("review");setNotice(null);};
  const patch=(value:Partial<Draft>)=>setSelected((current)=>current?{...current,...value}:current);
  const patchEntry=(index:number,value:Partial<Entry>)=>setSelected((current)=>current?{...current,entries:current.entries.map((entry,position)=>position===index?{...entry,...value}:entry)}:current);
  const save=async(publish:boolean)=>{
    if(!selected)return;
    const draft={...selected,entries:selected.entries.map((entry)=>({...entry,text:entry.text.trim()})).filter((entry)=>entry.text),published:publish||selected.published};
    const visible=draft.entries.filter((entry)=>!projects.find((project)=>project.id===entry.projectId)?.excluded);
    if(!draft.title.trim()||!draft.summary.trim()||!draft.entries.length){setNotice({type:"error",text:"Add a title, summary, and at least one project entry."});return;}
    if(publish&&!visible.length){setNotice({type:"error",text:"Include a project with an entry before approving."});return;}
    setSaving(true);setNotice(null);
    try {
      const exists=updates.some((item)=>item.id===selected.id);
      if(!exists&&publish) {
        const created=await api<{update:Draft}>("/api/admin/updates",{method:"POST",body:JSON.stringify({...draft,published:false,id:slug(draft.id)})});
        setUpdates((current)=>[created.update,...current]);setSelected(created.update);
        setNotice({type:"success",text:"Draft saved. Review the preview, then approve it."});
        return;
      }
      const result=await api<{update:Draft}>(exists?`/api/admin/updates/${encodeURIComponent(selected.id)}`:"/api/admin/updates",{method:exists?"PUT":"POST",body:JSON.stringify({...draft,id:slug(draft.id)})});
      setSelected(result.update);setUpdates((current)=>[result.update,...current.filter((item)=>item.id!==result.update.id)]);
      setNotice({type:"success",text:publish?"Approved. It will appear on /updates after the next publishing sync.":"Draft saved in the review queue."});
    }catch(caught){setNotice({type:"error",text:caught instanceof Error?caught.message:"Could not save."});}
    finally{setSaving(false);}
  };
  const unpublish=async()=>{
    if(!selected||!window.confirm("Remove this update from the public page?"))return;
    setSaving(true);
    try{const result=await api<{update:Draft}>(`/api/admin/updates/${encodeURIComponent(selected.id)}`,{method:"PUT",body:JSON.stringify({...selected,published:false})});
      setSelected(result.update);setUpdates((current)=>current.map((item)=>item.id===result.update.id?result.update:item));
      setNotice({type:"success",text:"Unpublished. It will be removed from /updates after the next publishing sync."});
    }catch(caught){setNotice({type:"error",text:caught instanceof Error?caught.message:"Could not unpublish."});}
    finally{setSaving(false);}
  };
  const remove=async()=>{
    if(!selected||selected.published||!window.confirm(`Delete “${selected.title}”?`))return;
    setSaving(true);
    try{await api(`/api/admin/updates/${encodeURIComponent(selected.id)}`,{method:"DELETE",body:"{}"});
      setUpdates((current)=>current.filter((item)=>item.id!==selected.id));setSelected(null);
      setNotice({type:"success",text:"Draft deleted."});
    }catch(caught){setNotice({type:"error",text:caught instanceof Error?caught.message:"Could not delete."});}
    finally{setSaving(false);}
  };
  const createProject=async()=>{
    const name=newProject.trim();if(!name)return;
    setSaving(true);
    try{const result=await api<{projects:Project[]}>("/api/admin/updates/projects",{method:"POST",body:JSON.stringify({id:`${slug(name)}-${crypto.randomUUID().slice(0,8)}`,name})});
      setProjects(result.projects);setNewProject("");setNotice({type:"success",text:"Project added as excluded. Include it when its work is ready for public updates."});
    }catch(caught){setNotice({type:"error",text:caught instanceof Error?caught.message:"Could not add project."});}
    finally{setSaving(false);}
  };
  const saveProject=async(project:Project)=>{
    setSaving(true);
    try{const result=await api<{projects:Project[]}>(`/api/admin/updates/projects/${encodeURIComponent(project.id)}`,{method:"PUT",body:JSON.stringify({name:project.name,excluded:project.excluded})});
      setProjects(result.projects);setNotice({type:"success",text:"Project settings saved. Published changes take effect after the next sync."});
    }catch(caught){setNotice({type:"error",text:caught instanceof Error?caught.message:"Could not save project."});}
    finally{setSaving(false);}
  };
  const changeSchedule=async(minutes:number)=>{
    setSaving(true);
    try{setSync(await api<Sync>("/api/admin/updates/sync",{method:"PUT",body:JSON.stringify({intervalMinutes:minutes})}));setNotice({type:"success",text:"Publishing schedule updated."});}
    catch(caught){setNotice({type:"error",text:caught instanceof Error?caught.message:"Could not update schedule."});}
    finally{setSaving(false);}
  };
  const requestSync=async()=>{
    setSaving(true);
    try{setSync(await api<Sync>("/api/admin/updates/sync/request",{method:"POST",body:"{}"}));setNotice({type:"success",text:"Manual sync queued for the next GitHub Actions check (within about 15 minutes)."});}
    catch(caught){setNotice({type:"error",text:caught instanceof Error?caught.message:"Could not request sync."});}
    finally{setSaving(false);}
  };
  const grouped=useMemo(()=>{
    const groups=new Map<string,{id:string;name:string;bullets:string[]}>();
    for(const entry of selected?.entries??[]) {
      const project=projects.find((item)=>item.id===entry.projectId);
      if(!project||project.excluded||!entry.text.trim())continue;
      if(!groups.has(project.id))groups.set(project.id,{id:project.id,name:project.name,bullets:[]});
      groups.get(project.id)?.bullets.push(entry.text);
    }
    return [...groups.values()];
  },[selected,projects]);
  const preview:PublishedUpdate[]=selected&&grouped.length?[{id:selected.id,title:selected.title,date:selected.date,summary:selected.summary,projects:grouped,bullets:grouped.flatMap((group)=>group.bullets)}]:[];
  if(loading)return <main className={styles.shell}><div className={styles.loading}><h1>Opening update review…</h1></div></main>;
  if(!email)return <main className={styles.shell}><div className={styles.empty}><div><h1>Update review is locked</h1><p>{notice?.text??"Sign in through Cloudflare Access to continue."}</p></div></div></main>;
  return <main className={styles.shell}>
    <header className={styles.topbar}><div className={styles.brand}><span className={styles.mark}>JC</span><div><strong>Update Studio</strong><span>{email}</span></div></div><div className={styles.topActions}><a className={styles.ghost} href="/admin/">Project Studio</a><a className={styles.ghost} href="/updates/" target="_blank" rel="noreferrer">Public updates ↗</a></div></header>
    <div className={styles.updateTabs} role="tablist" aria-label="Update Studio sections">
      {(["review","projects","sync"] as Tab[]).map((item)=><button key={item} type="button" role="tab" aria-selected={tab===item} data-active={tab===item} onClick={()=>{setTab(item);setNotice(null);}}>{item==="review"?"Review drafts":item==="projects"?"Project exclusions":"Publish sync"}</button>)}
    </div>
    {notice&&<div className={notice.type==="error"?styles.error:styles.success} role="status">{notice.text}</div>}
    {tab==="review"&&<div className={styles.updateLayout}>
      <aside className={styles.updateSidebar}><button className={styles.button} type="button" onClick={create}>+ New update</button>
        <div className={styles.projectList}>{updates.map((item)=><button type="button" className={styles.projectItem} data-active={selected?.id===item.id} onClick={()=>choose(item)} key={item.id}><div><strong>{item.title}</strong><span>{item.date} · {item.published?"Approved":"Needs review"}</span><small>{[...new Set(item.entries.map((entry)=>projects.find((project)=>project.id===entry.projectId)?.name??"Unassigned"))].join(" · ")}</small></div><i className={`${styles.dot} ${item.published?styles.published:""}`}/></button>)}</div>
      </aside>
      <section className={styles.updateMain}>{selected?<><div className={styles.section}><header className={styles.sectionHeader}><h2>Post details</h2><p>Review every word before approving.</p></header><div className={styles.sectionBody}>
        <label className={styles.label}>Title<input className={styles.input} value={selected.title} onChange={(event)=>patch({title:event.target.value})}/></label>
        <div className={styles.grid2}><label className={styles.label}>Date<input className={styles.input} type="date" value={selected.date} onChange={(event)=>patch({date:event.target.value})}/></label><label className={styles.label}>Post slug<input className={styles.input} value={selected.id} disabled={updates.some((item)=>item.id===selected.id)} onChange={(event)=>patch({id:slug(event.target.value)})}/></label></div>
        <label className={styles.label}>Short summary<textarea className={styles.textarea} value={selected.summary} onChange={(event)=>patch({summary:event.target.value})}/></label>
      </div></div>
      <div className={styles.section}><header className={styles.sectionHeader}><h2>Changes by project</h2><p>Each change belongs to a project. Excluded projects stay private and are hidden from the preview.</p></header><div className={styles.sectionBody}>
        {projects.map((project)=>{const projectEntries=selected.entries.map((entry,index)=>({...entry,index})).filter((entry)=>entry.projectId===project.id);if(!projectEntries.length)return null;
          return <div className={styles.entryGroup} key={project.id}><h3>{project.name} {project.excluded&&<small>Excluded from publishing</small>}</h3>
            {projectEntries.map((entry)=><div className={styles.listRow} key={entry.index}><div><select className={styles.select} aria-label={`Project for change ${entry.index+1}`} value={entry.projectId} onChange={(event)=>patchEntry(entry.index,{projectId:event.target.value})}>{projects.map((choice)=><option value={choice.id} key={choice.id}>{choice.name}{choice.excluded?" · excluded":""}</option>)}</select><textarea className={styles.textarea} aria-label={`Change ${entry.index+1}`} value={entry.text} onChange={(event)=>patchEntry(entry.index,{text:event.target.value})}/></div><button className={styles.danger} type="button" onClick={()=>patch({entries:selected.entries.filter((_,index)=>index!==entry.index)})}>Remove</button></div>)}
          </div>;})}
        <div className={styles.row}><button className={styles.ghost} type="button" disabled={!projects.length} onClick={()=>patch({entries:[...selected.entries,{projectId:projects.find((item)=>!item.excluded)?.id??projects[0].id,text:""}]})}>+ Add a change</button><button className={styles.ghost} type="button" onClick={()=>setTab("projects")}>Manage projects</button></div>
      </div></div>
      <div className={styles.section}><header className={styles.sectionHeader}><h2>Page preview</h2><p>This uses the public updates card layout and shows only included projects.</p></header><div className={styles.updatePreview}>{preview.length?<UpdateCards updates={preview}/>:<p>No included project changes will appear on the page.</p>}</div></div>
      <div className={styles.section}><header className={styles.sectionHeader}><h2>Approval</h2><p>{selected.published?"Changes are queued for the next publishing sync.":"Only approved updates appear on the public page."}</p></header><div className={styles.sectionBody}><div className={styles.row}>
        <button className={styles.button} type="button" disabled={saving||!dirty} onClick={()=>void save(false)}>{saving?"Saving…":selected.published?"Save changes":"Save draft"}</button>
        {!selected.published&&<button className={styles.button} type="button" disabled={saving||!preview.length} onClick={()=>void save(true)}>Approve &amp; publish</button>}
        {selected.published&&<button className={styles.ghost} type="button" disabled={saving} onClick={()=>void unpublish()}>Unpublish</button>}
        {!selected.published&&updates.some((item)=>item.id===selected.id)&&<button className={styles.danger} type="button" disabled={saving} onClick={()=>void remove()}>Delete draft</button>}
      </div></div></div>
    </>:<div className={styles.empty}><div><h1>No draft selected</h1><button className={styles.button} type="button" onClick={create}>Create an update</button></div></div>}</section>
    </div>}
    {tab==="projects"&&<section className={styles.updateSettings}><h1>Projects &amp; exclusions</h1><p>Every change is assigned to a project. New projects start excluded. Turn off exclusion only for work you want eligible for public posts; approval is still required.</p>
      <div className={styles.section}><div className={styles.sectionBody}>{projects.map((project)=><div className={styles.projectSetting} key={project.id}><input className={styles.input} aria-label={`Name for ${project.id}`} value={project.name} onChange={(event)=>setProjects((current)=>current.map((item)=>item.id===project.id?{...item,name:event.target.value}:item))}/><label className={styles.check}><input type="checkbox" checked={project.excluded} onChange={(event)=>setProjects((current)=>current.map((item)=>item.id===project.id?{...item,excluded:event.target.checked}:item))}/>Exclude from updates</label><button className={styles.ghost} type="button" disabled={saving} onClick={()=>void saveProject(project)}>Save</button></div>)}</div></div>
      <div className={styles.section}><header className={styles.sectionHeader}><h2>Add a project</h2></header><div className={styles.sectionBody}><div className={styles.row}><input className={styles.input} aria-label="New project name" placeholder="Project name" value={newProject} onChange={(event)=>setNewProject(event.target.value)}/><button className={styles.button} type="button" disabled={saving||!newProject.trim()} onClick={()=>void createProject()}>Add excluded project</button></div></div></div>
    </section>}
    {tab==="sync"&&<section className={styles.updateSettings}><h1>Publishing control</h1><p>Approved updates are copied to GitHub Pages on this schedule. GitHub checks for work every 15 minutes, so starts can be delayed.</p>
      <div className={styles.section}><div className={styles.sectionBody}><label className={styles.label}>Publish cadence<select className={styles.select} value={sync?.intervalMinutes??60} disabled={saving} onChange={(event)=>void changeSchedule(Number(event.target.value))}><option value={15}>Every 15 minutes</option><option value={60}>Hourly</option><option value={360}>Every 6 hours</option><option value={1440}>Daily</option></select></label>
        <div className={styles.syncStats}><div><span>Next publishing sync</span><strong>{sync?dateTime(sync.nextPublishAt):"Loading…"}</strong></div><div><span>Next GitHub check</span><strong>{sync?dateTime(sync.nextCheckAt):"Loading…"}</strong></div><div><span>Last completed sync</span><strong>{sync?dateTime(sync.lastSyncedAt):"Not yet"}</strong></div></div>
        <div className={styles.row}><button className={styles.button} type="button" disabled={saving||!!sync?.manualRequestedAt&&sync.manualRequestedAt>sync.lastSyncedAt} onClick={()=>void requestSync()}>{sync?.manualRequestedAt&&sync.manualRequestedAt>sync.lastSyncedAt?"Manual sync queued":"Request sync now"}</button><a className={styles.ghost} href="https://github.com/nascarjake/jakedoesdev/actions/workflows/sync-approved-updates.yml" target="_blank" rel="noreferrer">Run immediately on GitHub ↗</a></div>
        <p className={styles.hint}>A Studio request runs at the next check, usually within 15 minutes. The GitHub link lets you start a run immediately.</p>
        {sync?.lastRunUrl&&<a className={styles.ghost} href={sync.lastRunUrl} target="_blank" rel="noreferrer">View last sync run ↗</a>}
      </div></div>
    </section>}
  </main>;
}
