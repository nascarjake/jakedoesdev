"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type WebGLMode =
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
  | "leasing"
  | "career"
  | "mocap";

type World = {
  root: THREE.Group;
  tick: (time: number, pointer: THREE.Vector2) => void;
};

const ACID = 0xd8ff3e;
const AMBER = 0xff9f43;
const ICE = 0x7edcff;
const PAPER = 0xf0eee6;

function material(
  color = ACID,
  opacity = 0.82,
  wireframe = false,
): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    wireframe,
    depthWrite: opacity >= 0.45,
    blending: opacity < 0.32 ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

function line(
  points: THREE.Vector3[],
  color = ACID,
  opacity = 0.72,
): THREE.Line {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function dot(
  radius = 0.08,
  color = ACID,
  opacity = 1,
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.IcosahedronGeometry(radius, 1),
    material(color, opacity),
  );
}

function panel(
  width: number,
  height: number,
  color = ACID,
): THREE.Group {
  const group = new THREE.Group();
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    material(color, 0.055),
  );
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, height)),
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
    }),
  );
  group.add(plane, edge);
  return group;
}

function addFloor(scene: THREE.Scene, color = ACID): void {
  const grid = new THREE.GridHelper(22, 32, color, color);
  const gridMaterial = grid.material as THREE.Material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.12;
  grid.position.y = -2.6;
  scene.add(grid);
}

function addAtmosphere(scene: THREE.Scene, amount = 320): THREE.Points {
  const positions = new Float32Array(amount * 3);
  for (let index = 0; index < amount; index += 1) {
    const radius = 4 + Math.random() * 10;
    const angle = Math.random() * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 9;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: ACID,
      size: 0.025,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(points);
  return points;
}

function addConnection(
  group: THREE.Group,
  start: THREE.Vector3,
  end: THREE.Vector3,
  color = ACID,
): void {
  group.add(line([start, end], color, 0.36));
  const pulse = dot(0.055, color);
  pulse.userData.pathStart = start;
  pulse.userData.pathEnd = end;
  pulse.userData.offset = Math.random();
  pulse.userData.isPulse = true;
  group.add(pulse);
}

function animatePulses(root: THREE.Object3D, time: number): void {
  root.traverse((child) => {
    if (!child.userData.isPulse) return;
    const progress = (time * 0.18 + child.userData.offset) % 1;
    child.position.lerpVectors(
      child.userData.pathStart,
      child.userData.pathEnd,
      progress,
    );
    child.scale.setScalar(0.6 + Math.sin(progress * Math.PI) * 0.9);
  });
}

function standardWorld(
  root: THREE.Group,
  animated: THREE.Object3D[] = [],
): World {
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = Math.sin(time * 0.17) * 0.13 + pointer.x * 0.22;
      root.rotation.x = pointer.y * 0.08;
      animated.forEach((object, index) => {
        object.rotation.y += 0.0025 + index * 0.0004;
      });
      animatePulses(root, time);
    },
  };
}

function buildDecision(): World {
  const root = new THREE.Group();
  const levels = [1, 2, 4, 7];
  const nodes: THREE.Vector3[][] = [];
  levels.forEach((count, level) => {
    const row: THREE.Vector3[] = [];
    for (let index = 0; index < count; index += 1) {
      const position = new THREE.Vector3(
        (index - (count - 1) / 2) * (5.7 / Math.max(count - 1, 1)),
        2.15 - level * 1.35,
        level * -0.48 + Math.sin(index * 2.1) * 0.3,
      );
      const node = dot(level === 0 ? 0.24 : 0.11, level === 3 ? ICE : ACID);
      node.position.copy(position);
      root.add(node);
      row.push(position);
      if (level > 0) {
        const parent = nodes[level - 1][
          Math.min(nodes[level - 1].length - 1, Math.floor(index / 2))
        ];
        addConnection(root, parent, position, level === 3 ? ICE : ACID);
      }
    }
    nodes.push(row);
  });
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.015, 8, 100),
    material(ACID, 0.55),
  );
  halo.position.y = 2.15;
  halo.rotation.x = Math.PI / 2;
  root.add(halo);
  return standardWorld(root, [halo]);
}

function buildAi(): World {
  const root = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, 4),
    new THREE.MeshPhysicalMaterial({
      color: 0x11170a,
      emissive: ACID,
      emissiveIntensity: 0.22,
      wireframe: true,
      transparent: true,
      opacity: 0.78,
    }),
  );
  root.add(core);
  const humanGate = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.05, 12, 140),
    material(AMBER, 0.75),
  );
  humanGate.rotation.x = Math.PI / 2.5;
  root.add(humanGate);
  const shards: THREE.Mesh[] = [];
  for (let index = 0; index < 36; index += 1) {
    const shard = new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.08 + Math.random() * 0.09),
      material(index % 5 === 0 ? AMBER : ACID, 0.72),
    );
    const angle = (index / 36) * Math.PI * 2;
    shard.position.set(
      Math.cos(angle) * (2.1 + Math.random()),
      (Math.random() - 0.5) * 3.8,
      Math.sin(angle) * (2.1 + Math.random()),
    );
    shards.push(shard);
    root.add(shard);
  }
  return {
    root,
    tick(time, pointer) {
      core.rotation.set(time * 0.12, time * 0.2, 0);
      humanGate.rotation.z = time * 0.18;
      root.rotation.y = pointer.x * 0.24;
      root.rotation.x = pointer.y * 0.08;
      shards.forEach((shard, index) => {
        shard.rotation.x = time * (0.2 + (index % 5) * 0.03);
        shard.rotation.y = -time * 0.16;
      });
    },
  };
}

function buildMarket(): World {
  const root = new THREE.Group();
  const curvePoints: THREE.Vector3[] = [];
  for (let index = 0; index < 40; index += 1) {
    const x = -4.8 + index * 0.25;
    const y =
      Math.sin(index * 0.53) * 0.6 +
      Math.sin(index * 0.17) * 0.8 +
      index * 0.045 -
      0.8;
    curvePoints.push(new THREE.Vector3(x, y, 0));
    if (index % 3 === 0) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, Math.abs(y + 2.2), 0.11),
        material(index % 2 ? ACID : AMBER, 0.42),
      );
      bar.position.set(x, -2.2 + Math.abs(y + 2.2) / 2, -0.35);
      root.add(bar);
    }
  }
  const chart = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curvePoints),
    new THREE.LineBasicMaterial({ color: ACID }),
  );
  root.add(chart);
  const ruleBlocks: THREE.Group[] = [];
  for (let index = 0; index < 4; index += 1) {
    const block = panel(1.3, 0.56, index === 3 ? AMBER : ICE);
    block.position.set(-2.2 + index * 1.45, 2.25, -0.4 - index * 0.18);
    root.add(block);
    ruleBlocks.push(block);
  }
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = pointer.x * 0.16 - 0.08;
      root.rotation.x = pointer.y * 0.06;
      chart.position.x = Math.sin(time * 0.35) * 0.12;
      ruleBlocks.forEach((block, index) => {
        block.position.y = 2.25 + Math.sin(time * 1.1 + index) * 0.12;
      });
    },
  };
}

function buildBroadcast(): World {
  const root = new THREE.Group();
  const transmitter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.62, 2.7, 12, 1, true),
    material(ACID, 0.62, true),
  );
  root.add(transmitter);
  const rings: THREE.Mesh[] = [];
  for (let index = 0; index < 5; index += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.1 + index * 0.48, 0.018, 8, 120),
      material(index === 4 ? AMBER : ACID, 0.42),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.4;
    root.add(ring);
    rings.push(ring);
  }
  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * Math.PI * 2;
    const satellite = panel(0.92, 0.52, index % 2 ? ICE : AMBER);
    satellite.position.set(Math.cos(angle) * 4, Math.sin(angle * 2) * 0.8, Math.sin(angle) * 3);
    satellite.lookAt(0, 0, 0);
    root.add(satellite);
    addConnection(root, new THREE.Vector3(0, 0.4, 0), satellite.position, ACID);
  }
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = time * 0.08 + pointer.x * 0.2;
      root.rotation.x = pointer.y * 0.08;
      rings.forEach((ring, index) => {
        const scale = 0.8 + ((time * 0.25 + index * 0.2) % 1) * 0.45;
        ring.scale.setScalar(scale);
        (ring.material as THREE.Material).opacity = 1.2 - scale;
      });
      animatePulses(root, time);
    },
  };
}

function buildDocuments(): World {
  const root = new THREE.Group();
  const pages: THREE.Group[] = [];
  for (let index = 0; index < 13; index += 1) {
    const page = panel(1.55, 2.05, index < 8 ? ACID : ICE);
    const angle = (index / 13) * Math.PI * 2;
    page.position.set(
      Math.cos(angle) * (1.8 + index * 0.08),
      (index - 6) * 0.14,
      Math.sin(angle) * (1.8 + index * 0.08),
    );
    page.rotation.set(-0.2, -angle + Math.PI / 2, angle * 0.1);
    pages.push(page);
    root.add(page);
  }
  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 2.65, 0.18),
    material(AMBER, 0.46, true),
  );
  phone.position.x = 4;
  root.add(phone);
  addConnection(root, new THREE.Vector3(2, 0, 0), phone.position, AMBER);
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = pointer.x * 0.2;
      root.rotation.x = pointer.y * 0.08;
      pages.forEach((page, index) => {
        page.position.y += Math.sin(time * 0.65 + index * 0.7) * 0.0018;
        page.rotation.z = Math.sin(time * 0.3 + index) * 0.09;
      });
      phone.rotation.y = Math.sin(time * 0.4) * 0.25;
      animatePulses(root, time);
    },
  };
}

function buildEngine(): World {
  const root = new THREE.Group();
  const world = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.75, 2),
    material(ICE, 0.55, true),
  );
  root.add(world);
  const windows: THREE.Group[] = [];
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    const window = panel(1.25, 0.76, index % 3 === 0 ? AMBER : ACID);
    window.position.set(Math.cos(angle) * 4.1, Math.sin(angle * 2) * 1.5, Math.sin(angle) * 3);
    window.lookAt(0, 0, 0);
    root.add(window);
    windows.push(window);
    addConnection(root, window.position, new THREE.Vector3(), ICE);
  }
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = time * 0.05 + pointer.x * 0.18;
      root.rotation.x = pointer.y * 0.07;
      world.rotation.y = -time * 0.22;
      world.rotation.x = time * 0.13;
      windows.forEach((window, index) => {
        window.position.y += Math.sin(time + index) * 0.0015;
      });
      animatePulses(root, time);
    },
  };
}

function buildBiopsy(): World {
  const root = new THREE.Group();
  const slices: THREE.Mesh[] = [];
  for (let index = 0; index < 18; index += 1) {
    const shape = new THREE.Mesh(
      new THREE.CircleGeometry(1.45 + Math.sin(index * 0.55) * 0.25, 64),
      material(ICE, 0.035),
    );
    shape.rotation.x = Math.PI / 2;
    shape.position.y = (index - 9) * 0.22;
    root.add(shape);
    slices.push(shape);
  }
  const tumor = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.8, 4),
    material(AMBER, 0.55, true),
  );
  tumor.scale.set(1.3, 0.75, 0.9);
  tumor.position.set(0.3, -0.2, 0.15);
  root.add(tumor);
  const scanPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 4.5),
    material(ACID, 0.055),
  );
  scanPlane.rotation.x = Math.PI / 2;
  root.add(scanPlane);
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = time * 0.09 + pointer.x * 0.28;
      root.rotation.x = pointer.y * 0.11;
      tumor.rotation.set(time * 0.14, -time * 0.18, 0);
      scanPlane.position.y = Math.sin(time * 0.7) * 2;
      slices.forEach((slice, index) => {
        (slice.material as THREE.Material).opacity =
          0.02 + Math.max(0, Math.sin(time * 0.7 - index * 0.18)) * 0.07;
      });
    },
  };
}

function buildImaging(): World {
  const root = new THREE.Group();
  const tunnel = new THREE.Group();
  for (let index = 0; index < 22; index += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.45 + Math.sin(index * 0.3) * 0.12, 0.025, 8, 80),
      material(index > 15 ? AMBER : ICE, 0.4),
    );
    ring.position.z = (index - 11) * 0.3;
    tunnel.add(ring);
  }
  tunnel.rotation.x = Math.PI / 2;
  root.add(tunnel);
  const record = panel(1.5, 2, ACID);
  record.position.set(-3.6, 0, 0);
  record.rotation.y = 0.45;
  const order = panel(1.5, 2, AMBER);
  order.position.set(3.6, 0, 0);
  order.rotation.y = -0.45;
  root.add(record, order);
  addConnection(root, record.position, new THREE.Vector3(), ICE);
  addConnection(root, new THREE.Vector3(), order.position, AMBER);
  return standardWorld(root, [tunnel]);
}

function buildTravel(): World {
  const root = new THREE.Group();
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 28, 18),
    material(ICE, 0.35, true),
  );
  root.add(globe);
  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 2.55, 0.2),
    material(ACID, 0.5, true),
  );
  phone.position.set(3.25, 0, 0);
  const watch = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.9, 0.22),
    material(AMBER, 0.62, true),
  );
  watch.position.set(-3.2, 0.6, 0);
  root.add(phone, watch);
  for (let index = 0; index < 5; index += 1) {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(2 + index * 0.15, 0.012, 6, 100, Math.PI * 0.8),
      material(index % 2 ? ACID : ICE, 0.45),
    );
    arc.rotation.set(index * 0.25, index * 0.7, index * 0.38);
    root.add(arc);
  }
  addConnection(root, new THREE.Vector3(), phone.position, ACID);
  addConnection(root, new THREE.Vector3(), watch.position, AMBER);
  return standardWorld(root, [globe]);
}

function buildFieldSales(): World {
  const root = new THREE.Group();
  const map = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 5, 18, 12),
    material(ACID, 0.22, true),
  );
  map.rotation.x = -Math.PI / 2.8;
  root.add(map);
  for (let index = 0; index < 12; index += 1) {
    const pin = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.48, 10),
      material(index === 7 ? AMBER : ACID, 0.82),
    );
    pin.position.set(
      (Math.random() - 0.5) * 6.3,
      0.3 + Math.random() * 0.5,
      (Math.random() - 0.5) * 3.6,
    );
    root.add(pin);
  }
  const payment = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.6, 0.2),
    material(AMBER, 0.62, true),
  );
  payment.position.set(3.5, 1.8, 0);
  root.add(payment);
  return standardWorld(root, [payment]);
}

function buildService(): World {
  const root = new THREE.Group();
  const stages = [
    { x: -3.4, color: ICE, shape: new THREE.CylinderGeometry(0.7, 0.7, 1.6, 18) },
    { x: 0, color: ACID, shape: new THREE.BoxGeometry(1.6, 2.1, 0.18) },
    { x: 3.4, color: AMBER, shape: new THREE.TorusGeometry(0.8, 0.16, 10, 40) },
  ];
  stages.forEach((stage, index) => {
    const mesh = new THREE.Mesh(stage.shape, material(stage.color, 0.55, true));
    mesh.position.x = stage.x;
    mesh.rotation.z = index === 0 ? Math.PI / 2 : 0;
    root.add(mesh);
    if (index) {
      addConnection(
        root,
        new THREE.Vector3(stages[index - 1].x, 0, 0),
        new THREE.Vector3(stage.x, 0, 0),
        stage.color,
      );
    }
  });
  return standardWorld(root);
}

function buildRestaurant(): World {
  const root = new THREE.Group();
  const tables: THREE.Mesh[] = [];
  for (let index = 0; index < 6; index += 1) {
    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.58, 0.08, 20),
      material(ICE, 0.42),
    );
    const angle = (index / 6) * Math.PI * 2;
    table.position.set(Math.cos(angle) * 3.2, Math.sin(angle * 1.8) * 0.6, Math.sin(angle) * 2.2);
    root.add(table);
    tables.push(table);
    addConnection(root, table.position, new THREE.Vector3(), ACID);
  }
  const pos = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.85, 1),
    material(ACID, 0.62, true),
  );
  const printer = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.05, 1.1),
    material(AMBER, 0.55, true),
  );
  printer.position.set(0, 0, -4);
  root.add(pos, printer);
  addConnection(root, new THREE.Vector3(), printer.position, AMBER);
  return standardWorld(root, [pos]);
}

function buildVoxel(): World {
  const root = new THREE.Group();
  const size = 12;
  const geometry = new THREE.BoxGeometry(0.42, 0.42, 0.42);
  const cubes = new THREE.InstancedMesh(
    geometry,
    material(ICE, 0.55, true),
    size * size,
  );
  const dummy = new THREE.Object3D();
  for (let x = 0; x < size; x += 1) {
    for (let z = 0; z < size; z += 1) {
      const height =
        Math.sin(x * 0.65) * 0.65 + Math.cos(z * 0.54) * 0.65;
      dummy.position.set((x - size / 2) * 0.46, height, (z - size / 2) * 0.46);
      dummy.updateMatrix();
      cubes.setMatrixAt(x * size + z, dummy.matrix);
    }
  }
  root.add(cubes);
  const toolRing = new THREE.Mesh(
    new THREE.TorusKnotGeometry(2.8, 0.035, 160, 10, 2, 5),
    material(ACID, 0.55),
  );
  toolRing.rotation.x = Math.PI / 2;
  root.add(toolRing);
  return standardWorld(root, [toolRing]);
}

function buildPuzzle(): World {
  const root = new THREE.Group();
  const cells: THREE.Mesh[] = [];
  for (let x = 0; x < 5; x += 1) {
    for (let y = 0; y < 5; y += 1) {
      const cell = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 0.82, 0.16),
        material((x + y) % 4 === 0 ? AMBER : ACID, 0.34, true),
      );
      cell.position.set((x - 2) * 0.9, (y - 2) * 0.9, Math.sin(x + y) * 0.12);
      root.add(cell);
      cells.push(cell);
    }
  }
  root.rotation.x = -0.25;
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = pointer.x * 0.18;
      root.rotation.x = -0.25 + pointer.y * 0.08;
      cells.forEach((cell, index) => {
        cell.position.z =
          Math.sin(time * 1.2 - index * 0.21) * 0.22 +
          (index === Math.floor(time * 1.5) % cells.length ? 0.5 : 0);
      });
    },
  };
}

function buildHandoff(): World {
  const root = new THREE.Group();
  const layers: THREE.Group[] = [];
  for (let index = 0; index < 7; index += 1) {
    const layer = panel(2.7 - index * 0.12, 1.65 - index * 0.05, index % 2 ? ICE : ACID);
    layer.position.set(-2.8, (index - 3) * 0.35, index * -0.12);
    layer.rotation.x = -0.35;
    root.add(layer);
    layers.push(layer);
  }
  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 3.25, 0.24),
    material(AMBER, 0.6, true),
  );
  phone.position.x = 3.15;
  root.add(phone);
  layers.forEach((layer) => addConnection(root, layer.position, phone.position, AMBER));
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = pointer.x * 0.12;
      root.rotation.x = pointer.y * 0.05;
      layers.forEach((layer, index) => {
        layer.position.x = -2.8 + Math.max(0, Math.sin(time * 0.45 - index * 0.12)) * 0.35;
      });
      phone.rotation.y = Math.sin(time * 0.35) * 0.25;
      animatePulses(root, time);
    },
  };
}

function buildStreaming(): World {
  const root = new THREE.Group();
  const query = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.09, 12, 80),
    material(ACID, 0.78),
  );
  root.add(query);
  const cards: THREE.Group[] = [];
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    const card = panel(1.2, 1.65, index % 3 === 0 ? AMBER : ICE);
    card.position.set(Math.cos(angle) * 3.8, Math.sin(index * 1.7) * 1.25, Math.sin(angle) * 2.5);
    card.lookAt(0, 0, 0);
    root.add(card);
    cards.push(card);
  }
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = time * 0.07 + pointer.x * 0.2;
      root.rotation.x = pointer.y * 0.06;
      query.rotation.z = -time * 0.18;
      cards.forEach((card, index) => {
        card.position.y += Math.sin(time + index) * 0.001;
      });
    },
  };
}

function buildLeasing(): World {
  const root = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.85, 1.65),
    material(ICE, 0.48, true),
  );
  body.position.y = 0.15;
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.72, 1.45),
    material(ICE, 0.34, true),
  );
  cabin.position.set(0.2, 0.88, 0);
  root.add(body, cabin);
  const wheels: THREE.Mesh[] = [];
  [-1.2, 1.2].forEach((x) => {
    [-0.92, 0.92].forEach((z) => {
      const wheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.43, 0.14, 12, 36),
        material(AMBER, 0.7),
      );
      wheel.position.set(x, -0.42, z);
      wheel.rotation.x = Math.PI / 2;
      root.add(wheel);
      wheels.push(wheel);
    });
  });
  const terms = panel(1.65, 2.15, ACID);
  terms.position.set(3.7, 0.6, 0);
  terms.rotation.y = -0.42;
  root.add(terms);
  return {
    root,
    tick(time, pointer) {
      root.rotation.y = Math.sin(time * 0.22) * 0.28 + pointer.x * 0.12;
      root.rotation.x = pointer.y * 0.05;
      wheels.forEach((wheel) => {
        wheel.rotation.z -= 0.015;
      });
    },
  };
}

function buildCareer(): World {
  const root = new THREE.Group();
  const pathPoints = [
    new THREE.Vector3(-5.2, -1.5, 0),
    new THREE.Vector3(-2.8, 0.7, -0.5),
    new THREE.Vector3(-0.4, -0.2, 0.6),
    new THREE.Vector3(2.1, 1.3, -0.35),
    new THREE.Vector3(5.1, 0.2, 0.3),
  ];
  const curve = new THREE.CatmullRomCurve3(pathPoints);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 120, 0.035, 8, false),
    material(ACID, 0.9),
  );
  root.add(tube);
  const rings: THREE.Mesh[] = [];
  pathPoints.forEach((point, index) => {
    const node = new THREE.Mesh(
      index === pathPoints.length - 1
        ? new THREE.IcosahedronGeometry(0.44, 2)
        : new THREE.TorusGeometry(0.32, 0.045, 10, 60),
      material(index === 2 ? AMBER : index === 4 ? ICE : ACID, 0.8),
    );
    node.position.copy(point);
    root.add(node);
    rings.push(node);
  });
  const particle = dot(0.12, PAPER);
  root.add(particle);
  return {
    root,
    tick(time, pointer) {
      const position = curve.getPoint((time * 0.07) % 1);
      particle.position.copy(position);
      root.rotation.y = pointer.x * 0.12;
      root.rotation.x = pointer.y * 0.05;
      rings.forEach((ring, index) => {
        ring.rotation.y = time * (0.18 + index * 0.03);
        ring.rotation.x = time * 0.11;
      });
    },
  };
}

function limb(
  radius: number,
  length: number,
  color = ICE,
): THREE.Group {
  const group = new THREE.Group();
  const surface = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 8, 14),
    new THREE.MeshPhysicalMaterial({
      color: 0x142126,
      emissive: color,
      emissiveIntensity: 0.13,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    }),
  );
  const cloud = new THREE.Points(
    surface.geometry.clone(),
    new THREE.PointsMaterial({
      color,
      size: 0.045,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(surface, cloud);
  return group;
}

function orientBetween(
  object: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
): void {
  object.position.copy(start).add(end).multiplyScalar(0.5);
  object.scale.y = start.distanceTo(end);
  object.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    end.clone().sub(start).normalize(),
  );
}

function cameraRig(position: THREE.Vector3): THREE.Group {
  const rig = new THREE.Group();
  rig.position.copy(position);
  rig.lookAt(0, 0.6, 0);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 0.34, 0.34),
    new THREE.MeshPhysicalMaterial({
      color: 0x050705,
      metalness: 0.72,
      roughness: 0.52,
      emissive: ACID,
      emissiveIntensity: 0.012,
    }),
  );
  const bodyEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.82, 0.34, 0.34)),
    new THREE.LineBasicMaterial({
      color: ACID,
      transparent: true,
      opacity: 0.48,
    }),
  );
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 0.24, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      emissive: ACID,
      emissiveIntensity: 0.32,
      metalness: 0.7,
      roughness: 0.1,
    }),
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 0.27;
  const led = dot(0.035, ACID);
  led.position.set(0.3, 0.08, 0.2);
  rig.add(body, bodyEdges, lens, led);

  const tripodTop = new THREE.Vector3(0, -0.18, 0);
  [
    new THREE.Vector3(-0.42, -1.6, 0.35),
    new THREE.Vector3(0.42, -1.6, 0.35),
    new THREE.Vector3(0, -1.6, -0.4),
  ].forEach((foot) => rig.add(line([tripodTop, foot], 0x64703a, 0.55)));
  return rig;
}

function buildMocap(): World {
  const root = new THREE.Group();
  const performer = new THREE.Group();
  performer.position.y = -0.45;
  root.add(performer);

  const torso = limb(0.48, 1.15);
  torso.position.y = 1.75;
  const pelvis = limb(0.39, 0.42, ACID);
  pelvis.position.y = 0.75;
  const head = new THREE.Group();
  const headMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.4, 3),
    new THREE.MeshPhysicalMaterial({
      color: 0x172326,
      emissive: ICE,
      emissiveIntensity: 0.15,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    }),
  );
  const headPoints = new THREE.Points(
    headMesh.geometry.clone(),
    new THREE.PointsMaterial({
      color: ICE,
      size: 0.04,
      blending: THREE.AdditiveBlending,
    }),
  );
  head.add(headMesh, headPoints);
  head.position.y = 3;

  const upperArmL = limb(0.16, 0.72);
  const upperArmR = limb(0.16, 0.72);
  const lowerArmL = limb(0.13, 0.72);
  const lowerArmR = limb(0.13, 0.72);
  const upperLegL = limb(0.21, 0.95, ACID);
  const upperLegR = limb(0.21, 0.95, ACID);
  const lowerLegL = limb(0.16, 0.9, ACID);
  const lowerLegR = limb(0.16, 0.9, ACID);

  const segments = {
    upperArmL,
    upperArmR,
    lowerArmL,
    lowerArmR,
    upperLegL,
    upperLegR,
    lowerLegL,
    lowerLegR,
  };
  performer.add(torso, pelvis, head, ...Object.values(segments));

  const cameras: THREE.Group[] = [];
  const frustums: THREE.Mesh[] = [];
  const rigPositions = [
    new THREE.Vector3(-5.2, 1.25, 3.1),
    new THREE.Vector3(5.2, 1.25, 3.1),
    new THREE.Vector3(-6, 2.05, -0.8),
    new THREE.Vector3(6, 2.05, -0.8),
    new THREE.Vector3(-3.2, 1.45, -5.2),
    new THREE.Vector3(3.2, 1.45, -5.2),
  ];
  for (let index = 0; index < 6; index += 1) {
    const position = rigPositions[index];
    const camera = cameraRig(position);
    cameras.push(camera);
    root.add(camera);

    const frustum = new THREE.Mesh(
      new THREE.ConeGeometry(2.45, 6.2, 4, 1, true),
      new THREE.MeshBasicMaterial({
        color: index % 2 ? ACID : ICE,
        transparent: true,
        opacity: 0.022,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    frustum.position.copy(position).multiplyScalar(0.5);
    frustum.lookAt(0, 1.1, 0);
    frustum.rotateX(Math.PI / 2);
    frustums.push(frustum);
    root.add(frustum);
  }

  const scanPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4.6),
    new THREE.MeshBasicMaterial({
      color: ACID,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  scanPlane.position.y = 1.5;
  root.add(scanPlane);

  const volume = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(3.7, 4.7, 3.7)),
    new THREE.LineBasicMaterial({
      color: ACID,
      transparent: true,
      opacity: 0.16,
    }),
  );
  volume.position.y = 1.15;
  root.add(volume);

  return {
    root,
    tick(time, pointer) {
      root.rotation.y = Math.sin(time * 0.08) * 0.08 + pointer.x * 0.2;
      root.rotation.x = pointer.y * 0.035;
      const sway = Math.sin(time * 1.25);
      const lift = Math.sin(time * 1.25 + Math.PI);
      orientBetween(
        upperArmL,
        new THREE.Vector3(-0.42, 2.36, 0),
        new THREE.Vector3(-1.05, 1.8 + sway * 0.28, 0.3),
      );
      orientBetween(
        lowerArmL,
        new THREE.Vector3(-1.05, 1.8 + sway * 0.28, 0.3),
        new THREE.Vector3(-1.4, 1.15 + sway * 0.18, 0.7),
      );
      orientBetween(
        upperArmR,
        new THREE.Vector3(0.42, 2.36, 0),
        new THREE.Vector3(1.05, 1.8 - sway * 0.28, -0.3),
      );
      orientBetween(
        lowerArmR,
        new THREE.Vector3(1.05, 1.8 - sway * 0.28, -0.3),
        new THREE.Vector3(1.45, 1.35 - sway * 0.18, -0.7),
      );
      orientBetween(
        upperLegL,
        new THREE.Vector3(-0.24, 0.73, 0),
        new THREE.Vector3(-0.38, -0.22, lift * 0.3),
      );
      orientBetween(
        lowerLegL,
        new THREE.Vector3(-0.38, -0.22, lift * 0.3),
        new THREE.Vector3(-0.45, -1.25, -lift * 0.18),
      );
      orientBetween(
        upperLegR,
        new THREE.Vector3(0.24, 0.73, 0),
        new THREE.Vector3(0.38, -0.22, -lift * 0.3),
      );
      orientBetween(
        lowerLegR,
        new THREE.Vector3(0.38, -0.22, -lift * 0.3),
        new THREE.Vector3(0.45, -1.25, lift * 0.18),
      );
      torso.rotation.z = sway * 0.035;
      head.rotation.y = sway * 0.16;
      performer.position.y = -0.45 + Math.abs(Math.sin(time * 1.25)) * 0.04;
      scanPlane.position.x = Math.sin(time * 0.62) * 1.85;
      scanPlane.rotation.y = Math.PI / 2;
      cameras.forEach((camera, index) => {
        camera.children[3].scale.setScalar(
          0.8 + Math.sin(time * 4 + index) * 0.35,
        );
      });
      frustums.forEach((frustum, index) => {
        (frustum.material as THREE.Material).opacity =
          0.014 + Math.max(0, Math.sin(time * 1.8 + index)) * 0.02;
      });
    },
  };
}

function createWorld(mode: WebGLMode): World {
  switch (mode) {
    case "decision": return buildDecision();
    case "ai": return buildAi();
    case "market": return buildMarket();
    case "broadcast": return buildBroadcast();
    case "documents": return buildDocuments();
    case "engine": return buildEngine();
    case "biopsy": return buildBiopsy();
    case "imaging": return buildImaging();
    case "travel": return buildTravel();
    case "field-sales": return buildFieldSales();
    case "service": return buildService();
    case "restaurant": return buildRestaurant();
    case "voxel": return buildVoxel();
    case "puzzle": return buildPuzzle();
    case "handoff": return buildHandoff();
    case "streaming": return buildStreaming();
    case "leasing": return buildLeasing();
    case "career": return buildCareer();
    case "mocap": return buildMocap();
  }
}

function disposeWorld(scene: THREE.Scene): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((entry: THREE.Material) => entry.dispose());
    }
  });
}

export function WebGLStage({
  mode,
  className = "",
  label,
}: {
  mode: WebGLMode;
  className?: string;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      canvas.dataset.webglFailed = "true";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x050705, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050705, mode === "mocap" ? 0.035 : 0.055);
    const camera = new THREE.PerspectiveCamera(
      mode === "mocap" ? 42 : 46,
      1,
      0.1,
      80,
    );
    camera.position.set(0, mode === "mocap" ? 2.1 : 0.3, mode === "mocap" ? 11.8 : 9.2);

    const world = createWorld(mode);
    scene.add(world.root);
    addFloor(scene, mode === "biopsy" || mode === "travel" ? ICE : ACID);
    const atmosphere = addAtmosphere(scene, mode === "mocap" ? 520 : 280);

    const ambient = new THREE.AmbientLight(0x7edcff, 0.72);
    const key = new THREE.PointLight(ACID, 18, 18);
    key.position.set(4, 5, 5);
    const fill = new THREE.PointLight(ICE, 10, 15);
    fill.position.set(-4, 1, 3);
    scene.add(ambient, key, fill);

    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      targetPointer.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
      );
    };
    const onPointerLeave = () => targetPointer.set(0, 0);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let visible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "160px" },
    );
    visibilityObserver.observe(canvas);

    let animationFrame = 0;
    const start = performance.now();
    const render = (now: number) => {
      animationFrame = window.requestAnimationFrame(render);
      if (!visible && !reducedMotion) return;
      const time = (now - start) / 1000;
      pointer.lerp(targetPointer, 0.055);
      world.tick(reducedMotion ? 0.8 : time, pointer);
      atmosphere.rotation.y = reducedMotion ? 0 : time * 0.008;
      renderer.render(scene, camera);
      if (reducedMotion) window.cancelAnimationFrame(animationFrame);
    };
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      disposeWorld(scene);
      renderer.dispose();
    };
  }, [mode]);

  return (
    <div className={`webgl-stage ${className}`}>
      <canvas ref={canvasRef} aria-label={label} role="img" />
      <div className="webgl-fallback">WEBGL SIGNAL UNAVAILABLE</div>
    </div>
  );
}
