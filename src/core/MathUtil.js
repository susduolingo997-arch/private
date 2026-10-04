export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const saturate = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (a, b, x) => {
  const t = saturate((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const smootherstep = (a, b, x) => {
  const t = saturate((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const damp = (cur, target, rate, dt) => lerp(cur, target, 1 - Math.exp(-rate * dt));
export const wrapAngle = (a) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};
export const lerpAngle = (a, b, t) => a + wrapAngle(b - a) * t;
export const DEG = Math.PI / 180;

/** Distance from point to segment, returns {d, t, x, z}. */
export function segDist(px, pz, ax, az, bx, bz, out) {
  const dx = bx - ax, dz = bz - az;
  const l2 = dx * dx + dz * dz;
  let t = l2 > 0 ? ((px - ax) * dx + (pz - az) * dz) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const x = ax + dx * t, z = az + dz * t;
  const ex = px - x, ez = pz - z;
  out.d = Math.sqrt(ex * ex + ez * ez);
  out.t = t; out.x = x; out.z = z;
  return out;
}

/** Catmull-Rom point on 2D control polyline (centripetal not needed at our scales). */
export function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return [
    0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

/** Resample a control polyline into an evenly spaced smooth polyline. */
export function splineSample(ctrl, spacing) {
  const pts = [];
  const n = ctrl.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(n - 1, i + 2)];
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const steps = Math.max(2, Math.ceil(segLen / 1.5));
    for (let k = 0; k < steps; k++) pts.push(catmull(p0, p1, p2, p3, k / steps));
  }
  pts.push([ctrl[n - 1][0], ctrl[n - 1][1]]);
  // even resample
  const out = [pts[0]];
  let acc = 0, last = pts[0];
  for (let i = 1; i < pts.length; i++) {
    let cur = pts[i];
    let d = Math.hypot(cur[0] - last[0], cur[1] - last[1]);
    while (acc + d >= spacing) {
      const f = (spacing - acc) / d;
      const nx = last[0] + (cur[0] - last[0]) * f, nz = last[1] + (cur[1] - last[1]) * f;
      out.push([nx, nz]);
      last = [nx, nz];
      d = Math.hypot(cur[0] - last[0], cur[1] - last[1]);
      acc = 0;
    }
    acc += d;
    last = cur;
  }
  const e = pts[pts.length - 1];
  const lo = out[out.length - 1];
  if (Math.hypot(e[0] - lo[0], e[1] - lo[1]) > spacing * 0.3) out.push(e);
  return out;
}
