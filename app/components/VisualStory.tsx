"use client";

import type { Project } from "../data/portfolio";

type SceneKind =
  | "decision"
  | "ai"
  | "market"
  | "broadcast"
  | "documents"
  | "engine"
  | "biopsy"
  | "imaging"
  | "travel"
  | "field-sales"
  | "service"
  | "restaurant"
  | "voxel"
  | "puzzle"
  | "handoff"
  | "streaming"
  | "leasing";

type SceneSpec = {
  kind: SceneKind;
  kicker: string;
  caption: string;
  labels: [string, string, string];
};

const projectScenes: Record<string, SceneSpec> = {
  "ignite-dialogue": {
    kind: "decision",
    kicker: "LIVE DECISION TOPOLOGY",
    caption: "One answer opens the next useful path.",
    labels: ["CUSTOMER", "DECISION TREE", "RIGHT PRODUCT"],
  },
  "ignite-ai": {
    kind: "ai",
    kicker: "HUMAN-IN-THE-MIDDLE",
    caption: "Machines accelerate the work. People keep control.",
    labels: ["MESSY INPUT", "AI + HUMAN", "READY TO SHIP"],
  },
  tradelab: {
    kind: "market",
    kicker: "STRATEGY EXECUTION LOOP",
    caption: "Signals become rules. Rules become timed action.",
    labels: ["MARKET DATA", "NO-CODE RULES", "AUTOMATION"],
  },
  "stream-elixir": {
    kind: "broadcast",
    kicker: "CREATOR GROWTH ORCHESTRATOR",
    caption: "One desktop app coordinated a scattered audience.",
    labels: ["CREATOR", "AUTOMATION", "4 CHANNELS"],
  },
  ezforms: {
    kind: "documents",
    kicker: "DOCUMENT LIFECYCLE",
    caption: "Build once, execute anywhere, learn from the result.",
    labels: ["DRAG + DROP", "FIELD APP", "REPORTING"],
  },
  "eternus-tools": {
    kind: "engine",
    kicker: "LIVE ENGINE BRIDGE",
    caption: "Web tools edited a running C++ world in real time.",
    labels: ["8 EDITORS", "WEBGL BRIDGE", "C++ ENGINE"],
  },
  "tumor-identifier": {
    kind: "biopsy",
    kicker: "SCAN-TO-VOLUME RECONSTRUCTION",
    caption: "Two-dimensional detections rebuilt as a 3D tumor map.",
    labels: ["BIOPSY SLICES", "DETECTION", "3D MODEL"],
  },
  ziprad: {
    kind: "imaging",
    kicker: "EHR-TO-IMAGING PIPELINE",
    caption: "Old systems, paper-shaped data, one automated order.",
    labels: ["EHR RECORD", "OCR + PDF", "IMAGING ORDER"],
  },
  traxo: {
    kind: "travel",
    kicker: "ITINERARY CONSTELLATION",
    caption: "Every leg, reward, and reminder followed the traveler.",
    labels: ["TRIP DATA", "PHONE", "WRIST"],
  },
  "trails-end": {
    kind: "field-sales",
    kicker: "FIELD SALE NETWORK",
    caption: "Schedule, locate, sell, and pay from anywhere.",
    labels: ["EVENT MAP", "MOBILE SALE", "PAYMENT"],
  },
  callsmart: {
    kind: "service",
    kicker: "SERVICE CALL FLOW",
    caption: "The whole job traveled with the technician.",
    labels: ["CUSTOMER", "WORK ORDER", "PAID"],
  },
  "foodtronix-mobile-pos": {
    kind: "restaurant",
    kicker: "TABLE-TO-KITCHEN LOOP",
    caption: "The order left the table before the server did.",
    labels: ["TABLET", "POS LOGIC", "KITCHEN"],
  },
  tug: {
    kind: "voxel",
    kicker: "WORLD-BUILDING TOOLCHAIN",
    caption: "A smooth voxel world surrounded by tools built for makers.",
    labels: ["SCRIPT", "EDITOR SUITE", "LIVING WORLD"],
  },
  daho: {
    kind: "puzzle",
    kicker: "HUMAN VS. CUSTOM AI",
    caption: "A compact number game with a thinking opponent.",
    labels: ["BOARD", "SEARCH", "COUNTERMOVE"],
  },
  jumpstart: {
    kind: "handoff",
    kicker: "DESIGN-TO-CODE COMPILER",
    caption: "Photoshop layers transformed into an iPhone foundation.",
    labels: ["PSD LAYERS", "JAVASCRIPT", "NATIVE UI"],
  },
  hubster: {
    kind: "streaming",
    kicker: "AVAILABILITY RESOLVER",
    caption: "One title searched across a fragmented streaming world.",
    labels: ["WHAT TO WATCH", "INDEX", "WHERE TO WATCH"],
  },
  "dm-auto-leasing": {
    kind: "leasing",
    kicker: "MOBILE LEASING JOURNEY",
    caption: "Inventory, terms, and intent compressed into a native app.",
    labels: ["VEHICLE", "TERMS", "DRIVE"],
  },
};

const experienceScenes: Record<
  string,
  { kind: SceneKind; label: string; metric: string }
> = {
  "Ignite Sales": {
    kind: "decision",
    label: "ENTERPRISE DECISIONS AT SCALE",
    metric: "AWS / MULTI-CLUSTER",
  },
  "Alchemist Technologies": {
    kind: "market",
    label: "IDEAS TURNED INTO PRODUCTS",
    metric: "2 FOUNDER PRODUCTS",
  },
  EZFORMS: {
    kind: "documents",
    label: "DOCUMENTS BECAME SOFTWARE",
    metric: "WEB / IOS / ANDROID",
  },
  "Nerd Kingdom": {
    kind: "engine",
    label: "TOOLS AROUND A LIVING ENGINE",
    metric: "8 CONNECTED EDITORS",
  },
  "Lucent Mobile": {
    kind: "travel",
    label: "MANY PRODUCTS, MANY SURFACES",
    metric: "WEEKLY DELIVERY",
  },
  FoodTronix: {
    kind: "restaurant",
    label: "SUPPORT PAIN BECAME A PRODUCT",
    metric: "+45% PRODUCTIVITY",
  },
  "Real World Web Design": {
    kind: "streaming",
    label: "THE WEB BEFORE THE PLAYBOOK",
    metric: "HTML / PHP / MYSQL",
  },
};

function SceneMachine({
  kind,
  labels,
}: {
  kind: SceneKind;
  labels: [string, string, string];
}) {
  return (
    <div className={`scene-machine scene-${kind}`} aria-hidden="true">
      <div className="scene-grid" />
      <div className="scene-route route-a" />
      <div className="scene-route route-b" />
      <div className="scene-route route-c" />

      <div className="scene-terminal terminal-a">
        <i />
        <span>{labels[0]}</span>
      </div>
      <div className="scene-terminal terminal-b">
        <i />
        <span>{labels[1]}</span>
      </div>
      <div className="scene-terminal terminal-c">
        <i />
        <span>{labels[2]}</span>
      </div>

      <div className="scene-object">
        <div className="object-core" />
        <div className="object-ring ring-a" />
        <div className="object-ring ring-b" />
        <div className="object-layer layer-a" />
        <div className="object-layer layer-b" />
        <div className="object-layer layer-c" />
        {Array.from({ length: 12 }, (_, index) => (
          <i
            className="object-particle"
            key={index}
            style={{ "--particle": index } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="scene-pulse pulse-a" />
      <div className="scene-pulse pulse-b" />
      <span className="scene-coordinate coordinate-a">X.042</span>
      <span className="scene-coordinate coordinate-b">LIVE / 60FPS</span>
    </div>
  );
}

export function ProjectScene({ project }: { project: Project }) {
  const scene = projectScenes[project.id];
  if (!scene) return null;

  return (
    <figure className={`project-story accent-${project.accent}`}>
      <figcaption>
        <span>{scene.kicker}</span>
        <p>{scene.caption}</p>
      </figcaption>
      <SceneMachine kind={scene.kind} labels={scene.labels} />
    </figure>
  );
}

export function ExperienceScene({ company }: { company: string }) {
  const scene = experienceScenes[company];
  if (!scene) return null;

  return (
    <div className={`experience-scene scene-${scene.kind}`}>
      <div className="experience-scene-copy">
        <span>{scene.label}</span>
        <b>{scene.metric}</b>
      </div>
      <SceneMachine
        kind={scene.kind}
        labels={["INPUT", "SYSTEM", "OUTCOME"]}
      />
    </div>
  );
}

export function MocapLab() {
  return (
    <figure className="mocap-lab">
      <figcaption>
        <span>2009—2013 / HOMEMADE OPTICAL STAGE</span>
        <b>SIX CAMERAS. ONE MOVING HUMAN. ZERO OFF-THE-SHELF PIPELINE.</b>
      </figcaption>
      <div
        className="mocap-stage"
        role="img"
        aria-label="Animated diagram of six PlayStation Eye cameras recording a performer for a custom three-dimensional motion capture system"
      >
        <div className="mocap-floor">
          {Array.from({ length: 8 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <div className="capture-volume">
          <div className="capture-ring ring-a" />
          <div className="capture-ring ring-b" />
        </div>

        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="eye-camera"
            key={index}
            style={{ "--camera": index } as React.CSSProperties}
          >
            <div className="camera-body">
              <i />
              <span>EYE {String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="camera-beam" />
          </div>
        ))}

        <div className="mocap-human">
          <i className="joint joint-head" />
          <i className="bone bone-spine" />
          <i className="joint joint-chest" />
          <i className="bone bone-arm-l" />
          <i className="bone bone-arm-r" />
          <i className="joint joint-hand-l" />
          <i className="joint joint-hand-r" />
          <i className="bone bone-leg-l" />
          <i className="bone bone-leg-r" />
          <i className="joint joint-foot-l" />
          <i className="joint joint-foot-r" />
          {Array.from({ length: 18 }, (_, index) => (
            <b
              className="capture-point"
              key={index}
              style={{ "--point": index } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="mocap-readout readout-left">
          <span>CAMERAS</span>
          <b>06 / SYNCED</b>
        </div>
        <div className="mocap-readout readout-right">
          <span>SOLVE</span>
          <b>3D SKELETON / LIVE</b>
        </div>
      </div>
    </figure>
  );
}
