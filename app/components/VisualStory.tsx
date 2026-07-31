"use client";

import type { Project } from "../data/portfolio";
import { WebGLStage, type WebGLMode } from "./WebGLStage";

type SceneSpec = {
  kind: WebGLMode;
  kicker: string;
  caption: string;
  readouts: [string, string, string];
};

const projectScenes: Record<string, SceneSpec> = {
  "ignite-dialogue": {
    kind: "decision",
    kicker: "DECISION GRAPH / LIVE",
    caption: "A branching product conversation rendered as a traversable system.",
    readouts: ["VARIABLE DEPTH", "SELF-DEFINING MODEL", "ENTERPRISE SCALE"],
  },
  "ignite-ai": {
    kind: "ai",
    kicker: "HUMAN CONTROL PLANE",
    caption: "Machine intelligence orbiting a deliberate human checkpoint.",
    readouts: ["OCR INGEST", "AGENT WORKFLOW", "HUMAN APPROVAL"],
  },
  tradelab: {
    kind: "market",
    kicker: "MARKET EXECUTION SURFACE",
    caption: "Live data, composable rules, and automation on one timing loop.",
    readouts: ["STREAMING DATA", "RULE GRAPH", "SYNC WORKERS"],
  },
  "stream-elixir": {
    kind: "broadcast",
    kicker: "MULTI-CHANNEL ORCHESTRATOR",
    caption: "A creator at the center of a synchronized platform network.",
    readouts: ["TWITCH", "YOUTUBE", "SOCIAL APIS"],
  },
  ezforms: {
    kind: "documents",
    kicker: "DOCUMENTS AS SOFTWARE",
    caption: "Structured pages spiral from authoring into mobile execution.",
    readouts: ["VISUAL BUILDER", "FIELD CAPTURE", "REPORTING"],
  },
  "eternus-tools": {
    kind: "engine",
    kicker: "LIVE ENGINE BRIDGE",
    caption: "Eight browser-based editors surrounding a running C++ world.",
    readouts: ["8 EDITORS", "WEBGL VIEWPORT", "C++ RUNTIME"],
  },
  "tumor-identifier": {
    kind: "biopsy",
    kicker: "VOLUMETRIC RECONSTRUCTION",
    caption: "Scan slices assemble around a detected three-dimensional mass.",
    readouts: ["18 SLICES", "TENSOR DETECTION", "3D VOLUME"],
  },
  ziprad: {
    kind: "imaging",
    kicker: "EHR → IMAGING",
    caption: "Legacy patient data passes through a normalized imaging tunnel.",
    readouts: ["EHR INPUT", "OCR / PDF", "RADIOLOGY ORDER"],
  },
  traxo: {
    kind: "travel",
    kicker: "TRAVEL DATA ORBIT",
    caption: "A trip model shared across globe, phone, and wrist.",
    readouts: ["ITINERARY", "REWARDS", "ANDROID WEAR"],
  },
  "trails-end": {
    kind: "field-sales",
    kicker: "FIELD COMMERCE MAP",
    caption: "Distributed sales events converging on a secure payment surface.",
    readouts: ["EVENT LOCATION", "NATIVE PAYMENT", "MILLIONS OF USERS"],
  },
  callsmart: {
    kind: "service",
    kicker: "SERVICE CALL / END TO END",
    caption: "Customer, work order, and payment resolved in one mobile flow.",
    readouts: ["CUSTOMER", "EQUIPMENT", "PAYMENT"],
  },
  "foodtronix-mobile-pos": {
    kind: "restaurant",
    kicker: "TABLE → KITCHEN",
    caption: "A live restaurant network routing tableside orders into production.",
    readouts: ["TABLET ORDER", "POS ENGINE", "KITCHEN PRINT"],
  },
  tug: {
    kind: "voxel",
    kicker: "SMOOTH VOXEL TOOLCHAIN",
    caption: "A procedural world wrapped in the tools required to build it.",
    readouts: ["TYPESCRIPT", "8 TOOL SURFACES", "C++ WORLD"],
  },
  daho: {
    kind: "puzzle",
    kicker: "CUSTOM SEARCH OPPONENT",
    caption: "A number field evaluating moves and counter-moves in depth.",
    readouts: ["BOARD STATE", "SEARCH TREE", "AI RESPONSE"],
  },
  jumpstart: {
    kind: "handoff",
    kicker: "PSD → NATIVE UI",
    caption: "Design layers travel through a compiler-like handoff into a phone.",
    readouts: ["LAYER PARSE", "ASSET SLICE", "IOS FOUNDATION"],
  },
  hubster: {
    kind: "streaming",
    kicker: "STREAMING RESOLVER",
    caption: "One query interrogating a fragmented field of media providers.",
    readouts: ["TITLE QUERY", "SERVICE INDEX", "AVAILABILITY"],
  },
  "dm-auto-leasing": {
    kind: "leasing",
    kicker: "NATIVE LEASING JOURNEY",
    caption: "Vehicle, terms, and intent assembled into an app-store experience.",
    readouts: ["INVENTORY", "LEASE TERMS", "NATIVE ANDROID"],
  },
};

export function ProjectScene({ project }: { project: Project }) {
  const scene = projectScenes[project.id];
  if (!scene) return null;

  return (
    <figure className={`project-story webgl-story accent-${project.accent}`}>
      <figcaption>
        <span>{scene.kicker}</span>
        <p>{scene.caption}</p>
      </figcaption>
      <WebGLStage
        mode={scene.kind}
        label={`${project.title}: ${scene.caption}`}
      />
      <div className="webgl-readouts" aria-hidden="true">
        {scene.readouts.map((readout, index) => (
          <span key={readout}>
            <i>0{index + 1}</i>
            {readout}
          </span>
        ))}
      </div>
      <div className="webgl-interaction-hint">MOVE POINTER / INSPECT SYSTEM</div>
    </figure>
  );
}

export function CareerAtlas() {
  return (
    <div className="career-atlas">
      <header>
        <span>24-YEAR SIGNAL PATH / 2002—NOW</span>
        <b>THE MEDIUM CHANGED. THE BUILDER KEPT MOVING.</b>
      </header>
      <WebGLStage
        mode="career"
        label="Interactive three-dimensional career path from early web development through mobile, creative tooling, cloud systems, and AI"
      />
      <div className="career-atlas-labels" aria-hidden="true">
        <span>WEB / 02</span>
        <span>PRODUCT / 11</span>
        <span>TOOLS / 15</span>
        <span>FOUNDER / 18</span>
        <span>AI / NOW</span>
      </div>
    </div>
  );
}

export function MocapLab() {
  return (
    <figure className="mocap-lab webgl-mocap">
      <figcaption>
        <span>2009—2013 / HOMEMADE OPTICAL STAGE</span>
        <b>
          SIX CONSUMER CAMERAS. SYNCHRONIZED VIEWS. A HOME-BUILT 3D
          RECONSTRUCTION PIPELINE.
        </b>
      </figcaption>
      <WebGLStage
        mode="mocap"
        label="Interactive WebGL reconstruction of six PlayStation Eye cameras capturing a moving performer as a volumetric point cloud"
      />
      <div className="mocap-hud hud-top">
        <span>CAPTURE VOLUME</span>
        <b>4.2M × 4.2M × 3.1M</b>
      </div>
      <div className="mocap-hud hud-left">
        <span>OPTICAL INPUT</span>
        <b>06 PS EYE / SYNCED</b>
      </div>
      <div className="mocap-hud hud-right">
        <span>RECONSTRUCTION</span>
        <b>2,846 VERTICES / LIVE</b>
      </div>
      <div className="mocap-timeline" aria-hidden="true">
        <span>RAW VIEWS</span>
        <i />
        <span>SILHOUETTE</span>
        <i />
        <span>TRIANGULATE</span>
        <i />
        <span>ANIMATE</span>
      </div>
    </figure>
  );
}
