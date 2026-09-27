export type ArcadeGame = {
  id: string;
  title: string;
  genre: string;
  cover: string;
  tagline: string;
  description: string;
  screenshots: { src: string; alt: string }[];
  playUrl?: string;
  embedUrl?: string;
  controlsHint?: string;
  video?: {
    type: "mp4" | "youtube";
    src: string;
    externalUrl: string;
    embedNotice?: string;
  };
  caseStudy?: string;
};

const cover = (id: string) => `/arcade/${id}-cover.webp`;
const shots = (id: string, captions: string[]) =>
  captions.map((alt, i) => ({
    src: `/arcade/screenshots/${id}-${i + 1}.webp`,
    alt,
  }));

// Launch only user-supplied public URLs. Covers are promotional illustrations;
// screenshots are authentic captures. DAHO's artwork is conceptual.
export const arcadeGames: ArcadeGame[] = [
  {
    id: "orbital-smash",
    title: "Orbital Smash",
    genre: "Physics survival",
    cover: cover("orbital-smash"),
    tagline: "Swing the chain. Smash the swarm.",
    description:
      "Build momentum and swing through a swarm in this orbital physics arcade game.",
    playUrl: "https://orbitalsmash.com",
    embedUrl: "https://nascarjake.github.io/orbital-smash/",
    screenshots: [],
    video: {
      type: "mp4",
      src: "https://nascarjake.github.io/orbital-smash/assets/OrbitalSmash-preview-eg-k7ubP.mp4",
      externalUrl:
        "https://nascarjake.github.io/orbital-smash/assets/OrbitalSmash-preview-eg-k7ubP.mp4",
    },
  },
  {
    id: "revo",
    title: "REVO",
    genre: "Rhythm",
    cover: cover("revo"),
    tagline: "Your keys. Your music.",
    description:
      "A keyboard rhythm game with multiple key layouts, difficulty levels, and a library of music to explore.",
    playUrl: "https://nascarjake.github.io/measure-web/",
    embedUrl: "https://nascarjake.github.io/measure-web/",
    screenshots: shots("revo", [
      "REVO music library with track selection, key layouts, and difficulty settings.",
    ]),
  },
  {
    id: "downbeat",
    title: "Downbeat",
    genre: "Skate + rhythm",
    cover: cover("downbeat"),
    tagline: "Your song. Your line.",
    description:
      "An arcade skate mixtape. Bring your music, find your flow, and thread tricks through the city.",
    playUrl: "https://nascarjake.github.io/measure-web/downbeat/",
    embedUrl: "https://nascarjake.github.io/measure-web/downbeat/",
    screenshots: shots("downbeat", [
      "Downbeat title screen with a skater and an urban half-pipe.",
      "Downbeat downhill skating gameplay with timing gates and trick scoring.",
    ]),
  },
  {
    id: "dye-day",
    title: "Dye Day!",
    genre: "Creative studio",
    cover: cover("dye-day"),
    tagline: "Fold it. Tie it. Make it yours.",
    description:
      "A playful tie-dye studio. Choose a fold, tie your shirt, splash on color, and finish a one-of-a-kind tee for the worldwide clothesline.",
    playUrl: "https://tyedye.jakedoesdev.com",
    embedUrl: "https://tyedye.jakedoesdev.com",
    controlsHint: "Mouse or touch controls.",
    screenshots: [],
  },
  {
    id: "daho",
    title: "DAHO",
    genre: "Strategy puzzle",
    cover: cover("daho"),
    tagline: "A little thought goes a long way.",
    description:
      "A board-game-inspired number puzzle with challenge modes and custom-written AI. Original Android prototype, rebuilt with Ionic and Angular.",
    screenshots: [],
    caseStudy: "/universe/#daho",
  },
  {
    id: "rack-ruin",
    playUrl: "https://nascarjake.github.io/rack-web/",
    embedUrl: "https://nascarjake.github.io/rack-web/",
    title: "Rack & Ruin",
    genre: "Roguelike pool",
    cover: cover("rack-ruin"),
    tagline: "One more rack. One more run.",
    description:
      "A roguelike pool gauntlet with classic billiards, shop twists, and changing tables.",
    screenshots: shots("rack-ruin", [
      "Rack & Ruin title menu with Ruin Run and Classic Pool modes.",
      "Rack & Ruin green-felt eight-ball table with an active pocket multiplier.",
      "Rack & Ruin blue-felt table with glowing modified pool balls.",
    ]),
    video: {
      type: "youtube",
      src: "https://www.youtube-nocookie.com/embed/Qb1iRTERCVA?start=1971",
      externalUrl: "https://youtu.be/Qb1iRTERCVA?t=1971",
    },
  },
  {
    id: "pinfall",
    playUrl: "https://nascarjake.github.io/bowling-web/",
    embedUrl: "https://nascarjake.github.io/bowling-web/",
    title: "Pinfall",
    genre: "Roguelike bowling",
    cover: cover("pinfall"),
    tagline: "Ten pins. Strange lanes.",
    description:
      "Bowling with roguelike routes, shops, special pins, boss lanes, and a daily lineup.",
    screenshots: shots("pinfall", [
      "Pinfall player hub with roguelike runs, ten-pin mode, and a daily lineup.",
    ]),
  },
  {
    id: "netrunner",
    playUrl: "https://nascarjake.github.io/netrunner/",
    embedUrl: "https://nascarjake.github.io/netrunner/",
    title: "Netrunner",
    genre: "Network strategy",
    cover: cover("netrunner"),
    tagline: "Keep the packets moving.",
    description:
      "Wire up server blades, manage network upgrades, and hold your infrastructure together through escalating attack waves.",
    screenshots: shots("netrunner", [
      "Netrunner server blades linked by blue network cables carrying data packets.",
      "Netrunner telemetry panel with rack thermals, diagnostic logs, and attack-wave status.",
    ]),
  },
  {
    id: "rift-riot",
    playUrl: "https://nascarjake.github.io/fight-web/",
    embedUrl: "https://nascarjake.github.io/fight-web/",
    title: "Rift Riot",
    genre: "Fighting",
    cover: cover("rift-riot"),
    tagline: "Find your opening. Make it count.",
    description:
      "An arena fighter with CPU and local versus modes, an arcade circuit, and a combat lab for exploring moves frame by frame.",
    screenshots: shots("rift-riot", [
      "Rift Riot main menu featuring Ivy and versus, local, and arcade modes.",
      "Rift Riot fighter selection featuring Rook and the character roster.",
      "Rift Riot fight between Raijin and Sora in a neon-lit street arena.",
      "Rift Riot combat lab showing hitboxes, frame data, and move properties.",
    ]),
  },
  {
    id: "millionaire",
    title: "Millionaire",
    genre: "AI trivia",
    cover: cover("millionaire"),
    tagline: "Fifteen questions. Your moment.",
    description:
      "A Who Wants to Be a Millionaire-inspired trivia game with a virtual studio and lifelines. The linked build offers practice mode; AI mode requires a hosted server.",
    playUrl: "https://nascarjake.github.io/trivia/",
    embedUrl: "https://nascarjake.github.io/trivia/",
    screenshots: shots("millionaire", [
      "Millionaire virtual quiz studio with a music question, lifelines, and the prize ladder.",
    ]),
  },
  {
    id: "fortune-quest",
    title: "Fortune Quest",
    genre: "Roguelike slots",
    cover: cover("fortune-quest"),
    tagline: "Give fortune another spin.",
    description:
      "A roguelike slot game. Take a look at the gameplay preview for a spin through Fortune Quest.",
    screenshots: [],
    video: {
      type: "youtube",
      src: "https://www.youtube-nocookie.com/embed/kJRTlCn5-xA",
      externalUrl: "https://youtu.be/kJRTlCn5-xA",
      embedNotice:
        "This preview is age-restricted by YouTube and must be watched there.",
    },
  },
];

export const studioCartridge: ArcadeGame = {
  id: "goose",
  title: "Goose Games",
  genre: "The studio",
  cover: cover("goose"),
  tagline: "Silly games. Serious code.",
  description:
    `${arcadeGames.length} games. Plenty of curiosity. Browse the cartridges, watch real gameplay, or load a browser game right here.`,
  screenshots: [],
  playUrl: "https://goosegames.dev",
};

export const arcadeCartridges = [studioCartridge, ...arcadeGames];
