// One deterministic synthetic specimen. The 2D paths and 3D surface share these points.
export const SLICE_COUNT = 7;
export const CONTOUR_POINTS = 72;
const radii = [0.13, 0.25, 0.36, 0.41, 0.35, 0.24, 0.12];
export const sliceHeights = Array.from({ length: SLICE_COUNT }, (_, i) => Number(((i - 3) * 0.3).toFixed(1)));

export function specimenRadius(y: number, angle: number) {
  return Math.sqrt(Math.max(0, 1 - (y / 1.42) ** 2)) * (1 + 0.065 * Math.sin(angle * 3 + y * 2) + 0.035 * Math.cos(angle * 5 - y));
}
export function contourPoint(slice: number, point: number) {
  const a = (point / CONTOUR_POINTS) * Math.PI * 2;
  const r = radii[slice] * (1 + 0.09 * Math.sin(a * 3 + slice * 0.35) + 0.05 * Math.cos(a * 5));
  return { x: 0.14 + Math.sin(slice * 0.6) * 0.065 + Math.cos(a) * r, y: sliceHeights[slice], z: -0.04 + Math.cos(slice * 0.4) * 0.045 + Math.sin(a) * r * 0.8 };
}
export function contourPath(slice: number) {
  return Array.from({ length: CONTOUR_POINTS }, (_, i) => {
    const p = contourPoint(slice, i);
    return `${i ? 'L' : 'M'}${(60 + p.x * 45).toFixed(2)},${(52 + p.z * 45).toFixed(2)}`;
  }).join(' ') + ' Z';
}
export function tissuePath(slice: number) {
  return Array.from({ length: CONTOUR_POINTS }, (_, i) => {
    const a = i / CONTOUR_POINTS * Math.PI * 2;
    const r = specimenRadius(sliceHeights[slice], a);
    return `${i ? 'L' : 'M'}${(60 + Math.cos(a) * r * 45).toFixed(2)},${(52 + Math.sin(a) * r * 34.2).toFixed(2)}`;
  }).join(' ') + ' Z';
}
export function reconstructionData() {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let s = 0; s < SLICE_COUNT; s++) for (let p = 0; p < CONTOUR_POINTS; p++) {
    const v = contourPoint(s, p); positions.push(v.x, v.y, v.z);
  }
  for (let s = 0; s < SLICE_COUNT - 1; s++) for (let p = 0; p < CONTOUR_POINTS; p++) {
    const a = s * CONTOUR_POINTS + p, b = s * CONTOUR_POINTS + (p + 1) % CONTOUR_POINTS;
    indices.push(a, a + CONTOUR_POINTS, b, b, a + CONTOUR_POINTS, b + CONTOUR_POINTS);
  }
  // Close both ends rather than leaving an open tube.
  for (const s of [0, SLICE_COUNT - 1]) {
    const center = positions.length / 3;
    const ring = Array.from({ length: CONTOUR_POINTS }, (_, p) => contourPoint(s, p));
    positions.push(ring.reduce((v, p) => v + p.x, 0) / CONTOUR_POINTS, sliceHeights[s], ring.reduce((v, p) => v + p.z, 0) / CONTOUR_POINTS);
    for (let p = 0; p < CONTOUR_POINTS; p++) {
      const a = s * CONTOUR_POINTS + p, b = s * CONTOUR_POINTS + (p + 1) % CONTOUR_POINTS;
      indices.push(...(s === 0 ? [center, a, b] : [center, b, a]));
    }
  }
  return { positions, indices };
}
