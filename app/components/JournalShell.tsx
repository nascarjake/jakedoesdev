import type { ReactNode } from "react";
import { WorkbenchShell, WorkspaceToolbar } from "./WorkbenchShell";

type JournalShellProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function JournalShell({ eyebrow, title, children }: JournalShellProps) {
  return (
    <WorkbenchShell section="notes">
      <WorkspaceToolbar label="Field notes">
        <span className="toolbar-label">FROM THE WORKBENCH</span>
      </WorkspaceToolbar>
      <div className="journal-shell">
        <section className="journal-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </section>
        {children}
      </div>
    </WorkbenchShell>
  );
}
