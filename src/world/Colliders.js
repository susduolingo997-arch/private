// Static collision shapes registered by streamed chunks. Two shapes only:
//   circle  { k:0, x, z, r }                      trunks, poles, bushes
//   box     { k:1, cx, cz, hx, hz, cs, sn }       walls, fences, benches (rotated about Y)
// Local->world follows GeoBuilder.box: x = cx + lx*cs + lz*sn ; z = cz - lx*sn + lz*cs.
const CELL = 16;
const ck = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);

export const circle = (x, z, r) => ({ k: 0, x, z, r, enabled: true });
export const box = (cx, cz, hx, hz, rot) => ({ k: 1, cx, cz, hx, hz, cs: Math.cos(rot), sn: Math.sin(rot), enabled: true });

export class Colliders {
  constructor() { this.grid = new Map(); this.owners = new Map(); }

  _cells(c) {
    let minx, maxx, minz, maxz;
    if (c.k === 0) { minx = c.x - c.r; maxx = c.x + c.r; minz = c.z - c.r; maxz = c.z + c.r; }
    else {
      const ex = Math.abs(c.hx * c.cs) + Math.abs(c.hz * c.sn), ez = Math.abs(c.hx * c.sn) + Math.abs(c.hz * c.cs);
      minx = c.cx - ex; maxx = c.cx + ex; minz = c.cz - ez; maxz = c.cz + ez;
    }
    return [Math.floor(minx / CELL), Math.floor(maxx / CELL), Math.floor(minz / CELL), Math.floor(maxz / CELL)];
  }

  add(owner, c) {
    const [a, b, d, e] = this._cells(c);
    for (let x = a; x <= b; x++) for (let z = d; z <= e; z++) {
      const k = ck(x, z);
      let l = this.grid.get(k);
      if (!l) { l = []; this.grid.set(k, l); }
      l.push(c);
    }
    let o = this.owners.get(owner);
    if (!o) { o = []; this.owners.set(owner, o); }
    o.push(c);
    return c;
  }

  removeOwner(owner) {
    const o = this.owners.get(owner);
    if (!o) return;
    for (const c of o) {
      const [a, b, d, e] = this._cells(c);
      for (let x = a; x <= b; x++) for (let z = d; z <= e; z++) {
        const k = ck(x, z);
        const l = this.grid.get(k);
        if (!l) continue;
        const i = l.indexOf(c);
        if (i >= 0) l.splice(i, 1);
        if (l.length === 0) this.grid.delete(k);
      }
    }
    this.owners.delete(owner);
  }

  /**
   * Push a circle of radius r at (x,z) out of all colliders. Returns the corrected
   * position in `out` ({x,z,hit}).
   */
  resolve(x, z, r, out) {
    out.hit = false;
    const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL);
    const z0 = Math.floor((z - r) / CELL), z1 = Math.floor((z + r) / CELL);
    for (let iter = 0; iter < 2; iter++) {
      for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
        const l = this.grid.get(ck(cx, cz));
        if (!l) continue;
        for (let i = 0; i < l.length; i++) {
          const c = l[i];
          if (!c.enabled) continue;
          if (c.k === 0) {
            const dx = x - c.x, dz = z - c.z;
            const rr = r + c.r;
            const d2 = dx * dx + dz * dz;
            if (d2 < rr * rr) {
              const d = Math.sqrt(d2) || 0.0001;
              x = c.x + (dx / d) * rr; z = c.z + (dz / d) * rr; out.hit = true;
            }
          } else {
            const dx = x - c.cx, dz = z - c.cz;
            const lx = dx * c.cs - dz * c.sn, lz = dx * c.sn + dz * c.cs;
            const px = Math.max(-c.hx, Math.min(c.hx, lx)), pz = Math.max(-c.hz, Math.min(c.hz, lz));
            let ex = lx - px, ez = lz - pz;
            const d2 = ex * ex + ez * ez;
            if (d2 < r * r) {
              let nx, nz;
              if (d2 > 1e-8) { const d = Math.sqrt(d2); nx = ex / d; nz = ez / d; const push = r - d; ex = nx * push; ez = nz * push; }
              else {
                // centre inside the box: push out through the nearest face
                const ox = c.hx - Math.abs(lx), oz = c.hz - Math.abs(lz);
                if (ox < oz) { ex = (lx >= 0 ? 1 : -1) * (ox + r); ez = 0; } else { ez = (lz >= 0 ? 1 : -1) * (oz + r); ex = 0; }
              }
              // local -> world delta
              x += ex * c.cs + ez * c.sn;
              z += -ex * c.sn + ez * c.cs;
              out.hit = true;
            }
          }
        }
      }
    }
    out.x = x; out.z = z;
    return out;
  }
}
