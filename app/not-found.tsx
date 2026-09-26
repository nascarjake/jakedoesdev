import Link from "next/link";
import { JournalShell } from "./components/JournalShell";

export default function NotFound() {
  return (
    <JournalShell eyebrow="404 / A WRONG TURN" title="This drawer is empty.">
      <div className="journal-empty">
        <p>
          That page might have moved, or the link took a wrong turn. There’s
          plenty to explore back at the workbench.
        </p>
        <Link href="/" className="button button-ink">
          Back to the arcade →
        </Link>
      </div>
    </JournalShell>
  );
}
