import { GeoBuilder, lin } from '../core/GeoBuilder.js';

// One shared car model. Body is white-ish so per-instance colour tints it; everything
// else is dark enough that the tint barely changes it.
let cache = null;
export const CAR_COLORS = [0xb9b9bd, 0x7a1f1f, 0x1f3a6b, 0x2d4a33, 0xe8e6df, 0x3a3a3e, 0xb69a3a, 0x6a7f94];

export function getCarModel() {
  if (cache) return cache;
  const white = [1, 1, 1], dark = lin(0x151618), glass = lin(0x1a2430), tyre = lin(0x0e0e10);
  const b = new GeoBuilder();
  // chassis / lower body
  b.box(0, 0.62, 0, 1.82, 0.62, 4.3, 0, white, { top: white });
  // bonnet + boot slight slope via smaller boxes
  b.box(0, 0.98, 1.35, 1.7, 0.1, 1.3, 0, white);
  b.box(0, 0.98, -1.55, 1.7, 0.1, 0.9, 0, white);
  // cabin
  b.box(0, 1.28, -0.15, 1.6, 0.62, 2.25, 0, white);
  // glass bands
  b.box(0, 1.32, -0.15, 1.64, 0.4, 2.0, 0, glass);
  b.box(0, 1.32, -0.15, 1.5, 0.4, 2.3, 0, glass);
  // roof
  b.box(0, 1.62, -0.15, 1.58, 0.06, 2.1, 0, white);
  // bumpers + underbody
  b.box(0, 0.36, 2.17, 1.8, 0.22, 0.14, 0, dark);
  b.box(0, 0.36, -2.17, 1.8, 0.22, 0.14, 0, dark);
  b.box(0, 0.3, 0, 1.7, 0.2, 4.1, 0, dark);
  for (const [x, z] of [[-0.88, 1.35], [0.88, 1.35], [-0.88, -1.35], [0.88, -1.35]]) b.box(x, 0.33, z, 0.22, 0.66, 0.66, 0, tyre);
  const body = b.build();
  body.userData.shared = true;
  const l = new GeoBuilder();
  const head = lin(0xfff2cf), tail = lin(0xff2a1a);
  for (const s of [-1, 1]) {
    l.box(s * 0.62, 0.7, 2.16, 0.36, 0.14, 0.05, 0, head);
    l.box(s * 0.66, 0.74, -2.16, 0.34, 0.12, 0.05, 0, tail);
  }
  const lights = l.build();
  lights.userData.shared = true;
  cache = { body, lights, length: 4.3, width: 1.82 };
  return cache;
}
