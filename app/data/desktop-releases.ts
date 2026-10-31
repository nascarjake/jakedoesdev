import type { DesktopRelease } from "../components/DesktopDownloadPage";
export const podcastRelease: DesktopRelease = {
 id: "markdown-podcast-narrator", slug: "markdown-podcast-studio", name: "Markdown Podcast Studio", version: "0.2.1",
 heading: "Turn your notes into a conversation worth listening to.",
 intro: "Drop in Markdown or research notes. Draft an editable two-host podcast, choose distinct local voices, and make an MP3 you can listen to anywhere.",
 tag: "Notes in. An episode out.", files: [
  {
    "label": "Mac · Apple Silicon",
    "detail": "M1 or newer · macOS 12+",
    "filename": "Markdown-Podcast-Studio-0.2.1-mac-arm64.zip",
    "sha256": "da8075cba4e12c2a192d722ca3910e4dd2402bfcf10389625b2bfb551b69f939",
    "bytes": 222254439
  },
  {
    "label": "Mac · Intel",
    "detail": "Intel processor · macOS 12+",
    "filename": "Markdown-Podcast-Studio-0.2.1-mac-x64.zip",
    "sha256": "b925a67739e078f2250ef0019ace5233941f72caccc19b4263bef9980b120a54",
    "bytes": 228470406
  },
  {
    "label": "Windows · 64-bit",
    "detail": "Windows 10/11 · Intel or AMD x64",
    "filename": "Markdown-Podcast-Studio-0.2.1-win-x64.zip",
    "sha256": "f0cc34f77b36fd49215eb0f8b664fbcc9c1acfd0ee4b3dd9d79c3205703b553b",
    "bytes": 273393234
  }
],
 features: [
  { title: "Give ideas two voices.", text: "Draft a talk-show style exchange with an optional writing provider. Edit every line and choose a distinct Kokoro voice for each host." },
  { title: "Keep the script yours.", text: "Paste notes or drop Markdown/text files. Optional codebase, Wikipedia, and web-source research can inform a draft; the final script stays editable." },
  { title: "Take the episode with you.", text: "Render voice audio locally and export MP3 through FFmpeg. Single-narrator mode reads prose directly without an AI writer." }
 ],
 requirements: "Electron includes the desktop runtime. MP3 export needs FFmpeg installed separately and on PATH. The Kokoro voice model downloads on first use. Automatic dialogue drafting needs LM Studio or a separately installed, signed-in Codex/Claude CLI.",
 steps: [
  { title: "Extract and open.", text: "Mac: unzip and move MarkdownPodcastNarrator.app to Applications. Windows: extract the entire folder and open MarkdownPodcastNarrator.exe; keep the companion files together." },
  { title: "Prepare the tools you need.", text: "Install FFmpeg using its official download guide at ffmpeg.org/download.html. For automatic drafting, start an LM Studio writing model locally or select your own signed-in CLI provider. No account or model is bundled." },
  { title: "Build the conversation.", text: "Drop a Markdown/text file, choose two voices, select your writer, and click Draft. Edit the Host A/Host B script. Or turn off two-host conversation to read prose directly." },
  { title: "Present and keep the MP3.", text: "Click Present & play. The first voice render downloads the Kokoro model. Finished files save in Music / Markdown Podcast Narrator; use Show file to find the result." }
 ],
 limitations: "Native CI checks startup, the rendered interface, and Kokoro/ONNX imports on each platform. These checks do not validate a complete generated episode, audio quality, or every writing provider. Notes and research sent to a CLI writer use your provider account and may consume limits or incur charges. The display name has changed; the project ID and local data location are preserved.",
 screenshots: [{ name: "studio", caption: "Episode workspace with a synthetic two-host script, source intake, and local voice choices." }]
};
export const streamDjRelease: DesktopRelease = {
 id: "stream-dj", slug: "stream-dj", name: "Stream DJ", version: "0.1.5", prerelease: true,
 heading: "Give your next live show a desk of its own.",
 intro: "A local-first desktop radio studio for your music library, show programming, audience requests, and optional AI DJ voice links. Plan the show, then take it on air when you are ready.",
 tag: "Build the lineup. Run the show.", files: [
  {
    "label": "Mac · Apple Silicon",
    "detail": "M1 or newer · macOS 12+",
    "filename": "Stream-DJ-0.1.5-mac-arm64.zip",
    "sha256": "2e5e79ba3441c9da847af5a95ceb6dc8062c018862d43f96847cad7a64aad65f",
    "bytes": 116388419
  },
  {
    "label": "Mac · Intel",
    "detail": "Intel processor · macOS 12+",
    "filename": "Stream-DJ-0.1.5-mac-x64.zip",
    "sha256": "1e10c4774e1c1e0b92c64c6ea6a26d918320a45cf61f57361d36a4f8394b95b0",
    "bytes": 121781954
  },
  {
    "label": "Windows · 64-bit",
    "detail": "Windows 10/11 · Intel or AMD x64",
    "filename": "Stream-DJ-0.1.5-win-x64.zip",
    "sha256": "8dfb136593dc49d2e9e9c6323dbcf2cdfb51ed4bd8d551511a83521dd2603b1d",
    "bytes": 142064590
  }
],
 features: [
  { title: "Shape a whole station.", text: "Create reusable show blocks, schedule a week, and organize a lineup with hosts, music, and talk segments." },
  { title: "Work from your library.", text: "Import audio you have permission to use, build a play queue, review audience requests, and control playback from one desk." },
  { title: "Choose your AI setup.", text: "Configure writing, music, and voice providers separately. Explore generated DJ links and content packages while keeping your station data local." }
 ],
 requirements: "The desktop runtime and local backend are included. Local audio playback and planning need no AI account. AI generation, local model/Python tools, FFmpeg processing, and streaming integrations have their own setup and are not bundled.",
 steps: [
  { title: "Extract and open.", text: "Mac: unzip and move StreamDJ.app to Applications. Windows: extract the whole folder and run StreamDJ.exe. Keep all extracted companion files together." },
  { title: "Bring your tracks.", text: "Open Music library and import local audio you have permission to play. The app opens idle; it does not start broadcasting or generating audio on launch." },
  { title: "Plan a block.", text: "Open Programming, create a block, and add it to your schedule. Review its music, participants, and talk segments before loading a day into the broadcast plan." },
  { title: "Configure, then go live.", text: "Use Station setup for optional writing/voice providers and platform connections. Return to On air, review the queue and output, then start the station when ready. Service accounts, keys, local models, and paid generation are your choice." }
 ],
 limitations: "This is an early desktop release. Native CI checks the packaged UI and authenticated loopback backend with a stopped synthetic station. Live Twitch/YouTube connections, real AI providers, generated music, device audio routing, and unattended broadcasting still need validation in your setup. The app source remains private. There is no hosted browser version.",
 screenshots: [{ name: "studio", caption: "Harbor FM synthetic station standing by, with on-air controls and a broadcast plan." }, { name: "programming", caption: "Reusable programming blocks and synthetic show participants in the block library." }]
};
