import type { Metadata } from "next";
import { JournalShell } from "../components/JournalShell";
import { arcadeGames } from "../data/arcade";

export const metadata: Metadata = {
  title: "Arcade",
  description: "Playable experiments and games by Jacob Clark.",
};

export default function ArcadePage() {
  return (
    <JournalShell eyebrow="PLAYABLE WORK" title="The Jacob Clark arcade.">
      <section className="arcade-grid" aria-label="Games">
        {arcadeGames.length ? (
          arcadeGames.map((game) => (
            <article className="arcade-card" key={game.title}>
              <p>{game.format}</p>
              <h2>{game.title}</h2>
              <span>{game.description}</span>
              <div>
                <a href={game.playUrl} target="_blank" rel="noreferrer">
                  Play ↗
                </a>
                {game.sourceUrl && (
                  <a href={game.sourceUrl} target="_blank" rel="noreferrer">
                    Source ↗
                  </a>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="journal-empty">
            <p>Cabinet warming up.</p>
            <span>Public game builds will appear here as they launch.</span>
          </div>
        )}
      </section>
    </JournalShell>
  );
}
