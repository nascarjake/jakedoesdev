import styles from "./LabVisuals.module.css";

const waveHeights = [18, 29, 43, 22, 56, 77, 35, 66, 88, 51, 27, 70, 98, 55, 32, 80, 46, 63, 24, 52, 91, 59, 30, 68, 44, 82, 25, 53, 72, 37, 19, 48];
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const musicNotes = [
  { left: "5%", top: "16%", width: "16%" }, { left: "16%", top: "49%", width: "11%" },
  { left: "26%", top: "34%", width: "18%" }, { left: "38%", top: "63%", width: "13%" },
  { left: "50%", top: "22%", width: "22%" }, { left: "67%", top: "49%", width: "15%" },
  { left: "77%", top: "34%", width: "18%" }, { left: "10%", top: "78%", width: "9%" },
  { left: "46%", top: "78%", width: "9%" }, { left: "83%", top: "78%", width: "9%" },
];

function Waveform({ className = "" }: { className?: string }) {
  return <div className={className || styles.waveform}>
    {waveHeights.map((height, index) => <span key={index} style={{ height: height + "%", animationDelay: index * -0.06 + "s" }} />)}
  </div>;
}

export function ExperimentVisual({ id, title, signal }: { id: string; title: string; signal: string }) {
  if (id === "stream-dj") return <div className={styles.djScene} aria-hidden="true">
    <div className={styles.sceneNoise} />
    <div className={styles.djHalo} />
    <div className={styles.djConsole}>
      <div className={styles.windowBar}><span><i /> STREAM DJ / STATION CONTROL</span><span>● ON AIR</span></div>
      <div className={styles.djMain}>
        <div className={styles.recordWrap}><div className={styles.record}><span /></div><div className={styles.recordArm} /></div>
        <div className={styles.djNow}><small>NOW PLAYING / AI DJ</small><strong>The room has a soundtrack.</strong><p>Requests, voice, and the next record in one place.</p><Waveform /></div>
      </div>
      <div className={styles.djQueue}><span>01 / LIVE SHOW</span><span>02 / REQUEST QUEUE</span><span>03 / NEXT RECORD</span></div>
    </div>
    <span className={styles.sceneCorner}>CONCEPT / 001</span>
  </div>;

  if (id === "jcal") return <div className={styles.calendarScene} aria-hidden="true">
    <div className={styles.calendarBloom} />
    <div className={styles.calendarWindow}>
      <div className={styles.calendarHeader}><span>✳ jcal</span><strong>One place for the whole week.</strong><span>WEEK VIEW / HOME</span></div>
      <div className={styles.calendarGrid}>{days.map((day, index) => <div className={styles.calendarDay} key={day}>
        <span>{day}</span><b>{String(index + 12).padStart(2, "0")}</b>
        {index === 1 && <i className={styles.eventMint}>FAMILY</i>}
        {index === 3 && <i className={styles.eventBlue}>PLANS</i>}
        {index === 5 && <i className={styles.eventPeach}>WEEKEND</i>}
      </div>)}</div>
      <div className={styles.calendarFooter}><span>● ALL CALENDARS SYNCED</span><span>ASK THE HOUSEHOLD ASSISTANT ↗</span></div>
    </div>
    <div className={styles.calendarFloat}>WHAT’S NEXT?<span>Everything, in one glance.</span></div>
  </div>;

  if (id === "clip-my-screen") return <div className={styles.clipScene} aria-hidden="true">
    <div className={styles.clipAura} />
    <div className={styles.clipWindow}>
      <div className={styles.windowBar}><span>CLIP MY SCREEN</span><span><i className={styles.recordDot} /> BUFFER ACTIVE</span></div>
      <div className={styles.clipCanvas}><div className={styles.clipWindowGhost}><span>That moment just happened.</span><strong>Keep it.</strong></div><div className={styles.captureCorners} /></div>
      <div className={styles.clipTimeline}><span>−15:00</span><div>{Array.from({ length: 32 }, (_, index) => <i key={index} style={{ height: (18 + (index * 13) % 38) + "px" }} />)}<b /></div><span>LIVE</span></div>
      <div className={styles.clipActions}><span>SCREEN / 01</span><strong>↙ SAVE THE LAST 15 MINUTES</strong></div>
    </div>
  </div>;

  if (id === "markdown-podcast-narrator") return <div className={styles.podcastScene} aria-hidden="true">
    <div className={styles.podcastAura} />
    <div className={styles.podcastPanel}>
      <div className={styles.windowBar}><span>MARKDOWN → CONVERSATION</span><span>EPISODE 01 / DRAFT</span></div>
      <div className={styles.podcastBody}>
        <div className={styles.hostCard}><span>A</span><strong>HOST A</strong><small>VOICE / HEART</small></div>
        <div className={styles.podcastCenter}><span>THE STORY TAKES SHAPE</span><Waveform className={styles.podcastWave} /><div><i /><i /><i /></div><strong>Two voices. One idea.</strong></div>
        <div className={styles.hostCard}><span>B</span><strong>HOST B</strong><small>VOICE / MICHAEL</small></div>
      </div>
      <div className={styles.podcastFooter}><span>EDIT THE SCRIPT</span><span>RENDER LOCALLY</span><span>PLAY IT BACK</span></div>
    </div>
  </div>;

  if (id === "music-writer") return <div className={styles.musicScene} aria-hidden="true">
    <div className={styles.musicGlow} />
    <div className={styles.musicPanel}>
      <div className={styles.windowBar}><span>MUSIC WRITER / SIGNAL TO STRUCTURE</span><span>STEM 03 / BASS</span></div>
      <div className={styles.musicSpectrum}>{waveHeights.map((height, index) => <i key={index} style={{ height: height + "%" }} />)}</div>
      <div className={styles.musicRoll}><div className={styles.musicKeys}>{["C", "B", "A", "G", "F", "E", "D"].map((key) => <span key={key}>{key}</span>)}</div><div className={styles.musicGrid}>{musicNotes.map((note, index) => <i key={index} style={note} />)}<b /></div></div>
      <div className={styles.musicFooter}><span>01 / SEPARATE</span><span>02 / TRANSCRIBE</span><span>03 / RECONSTRUCT</span></div>
    </div>
  </div>;

  return <div className={styles.genericScene} aria-hidden="true"><div className={styles.genericOrb} /><span>{signal}</span><small>{title.toUpperCase()} / EXPERIMENT IN MOTION</small></div>;
}
