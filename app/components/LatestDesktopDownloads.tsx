"use client";

import { useEffect, useState } from "react";
import type { DesktopRelease } from "./DesktopDownloadPage";
import { Icon } from "./WorkbenchIcons";
import styles from "./DesktopDownloadPage.module.css";

export function LatestDesktopDownloads({ app }: { app: DesktopRelease }) {
  const [release, setRelease] = useState(app);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/media/projects/releases/${app.slug}/latest.json?t=${Date.now()}`, { signal: controller.signal, cache: "no-store" })
      .then(response => response.ok ? response.json() as Promise<{ version: string; prerelease: boolean; files: { filename: string; sha256: string; bytes: number }[] }> : null)
      .then(data => {
        if (!data || typeof data.version !== "string" || !/^\d+\.\d+\.\d+$/.test(data.version) || typeof data.prerelease !== "boolean" || !Array.isArray(data.files) || data.files.length !== app.files.length) return;
        const files = app.files.map((original, index) => {
          const file = data.files[index];
          const expected = original.filename.replace(app.version, data.version);
          if (!file || file.filename !== expected || !/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isSafeInteger(file.bytes) || file.bytes <= 0) return null;
          return { ...original, filename: file.filename, sha256: file.sha256, bytes: file.bytes };
        });
        if (files.some(file => !file)) return;
        setRelease({ ...app, version: data.version, prerelease: data.prerelease, files: files as DesktopRelease["files"] });
      }).catch(() => {});
    return () => controller.abort();
  }, [app]);
  const base = `/api/media/projects/releases/${release.slug}/${release.version}/`;
  return <><p>Desktop release {release.version}{release.prerelease ? " (prerelease)" : ""}. Extract the full ZIP before opening the app.</p><div className={styles.platforms}>{release.files.map(file => <article key={file.filename}><h3>{file.label}</h3><p>{file.detail}</p><a className={styles.button} href={`${base}${file.filename}`}>Download ZIP ↓ <small>{Math.round(file.bytes / 1048576)} MB</small></a><details><summary>SHA-256 checksum</summary><code>{file.sha256}</code></details></article>)}</div><p className={styles.note}>These early builds are unsigned and not notarized. macOS or Windows may warn or block them because there is no verified publisher signature. No security-bypass launcher is included.</p><a className={styles.textLink} href={`${base}SHA256SUMS.txt`}>Download all checksums <Icon name="external" size={14} /></a></>;
}
