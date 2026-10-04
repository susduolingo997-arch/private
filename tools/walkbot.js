(async () => {
  const g = window.__game, W = g.world, R = W.roads.byId;
  g.began = true; g.paused = false; g.player.enabled = true;
  const p = g.player;
  p.teleport(6, 46, 0);
  const wps = [];
  const addRoad = (r, i0, i1, step = 3) => { const d = i1 >= i0 ? 1 : -1; for (let i = i0; d > 0 ? i <= i1 : i >= i1; i += d * step) wps.push([r.x[i], r.z[i], r.id + ':' + i]); };
  addRoad(R.track, 0, R.track.n - 1);
  // county: from nearest to track end to nearest to homelane start
  const nearest = (r, x, z) => { let b = 0, bd = 1e18; for (let i = 0; i < r.n; i++) { const d = (r.x[i] - x) ** 2 + (r.z[i] - z) ** 2; if (d < bd) { bd = d; b = i; } } return b; };
  const c0 = nearest(R.county, R.track.x[R.track.n - 1], R.track.z[R.track.n - 1]);
  const c1 = nearest(R.county, R.homelane.x[0], R.homelane.z[0]);
  // stay on the right-hand verge? walk the centreline offset to the right by 2.4 m to avoid traffic
  const off = (r, i, side) => { const j = Math.min(r.n - 1, i + 1), k = Math.max(0, i - 1); const tx = r.x[j] - r.x[k], tz = r.z[j] - r.z[k], l = Math.hypot(tx, tz); return [r.x[i] + (-tz / l) * side, r.z[i] + (tx / l) * side]; };
  for (let i = c0; i <= c1; i += 3) { const [x, z] = off(R.county, i, 1.6); wps.push([x, z, 'county:' + i]); }
  addRoad(R.homelane, 0, R.homelane.n - 1);
  const home = W.structures.home; const door = home.doorWorld; const f = home.front;
  wps.push([door[0] + f[0] * 2.0, door[1] + f[1] * 2.0, 'frontdoor']);
  wps.push([door[0] + f[0] * 0.2, door[1] + f[1] * 0.2, 'door']);
  wps.push([home.x, home.z, 'inside']);
  const stuck = [];
  let wi = 0, t = 0, lastX = p.x, lastZ = p.z, lastT = 0, steps = 0, maxStuck = 0, doorOpened = false;
  const dt = 0.05;
  const t0 = performance.now();
  while (wi < wps.length && steps < 80000 && performance.now() - t0 < 100000) {
    const [tx, tz, name] = wps[wi];
    const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
    if (d < 1.6) { wi++; continue; }
    if (name === 'door' && !doorOpened) {
      // open the door through the interaction system
      g.chunks.forEachInteractable(p.x, p.z, (it) => { if (it.type === 'door' && it.building.id === 'home') { g.interaction.use(it); doorOpened = true; } });
    }
    p.yaw = Math.atan2(-dx, -dz);
    g.input.keys.add('KeyW');
    p.update(dt);
    g.time.update(dt, 24); g.weather.update(dt, g.time);
    for (const s of g.systems) if (s.update) s.update(dt, g);
    g.camera.updateMatrixWorld();
    steps++; t += dt;
    if (steps % 6 === 0) g.chunks.update(p.x, p.z, 1e6);
    if (t - lastT > 6) {
      const moved = Math.hypot(p.x - lastX, p.z - lastZ);
      if (moved < 3) { stuck.push([name, p.x.toFixed(1), p.z.toFixed(1), moved.toFixed(2)]); wi++; /* skip ahead */ }
      lastX = p.x; lastZ = p.z; lastT = t;
    }
  }
  const home2 = home.toLocal(p.x, p.z);
  return { done: wi >= wps.length, wi, total: wps.length, steps, simSeconds: t.toFixed(0), stuck, pos: [p.x.toFixed(1), p.z.toFixed(1)], localInHome: home2.map((v) => v.toFixed(2)), arrived: g.arrived, dist: p.distanceWalked.toFixed(0), ms: (performance.now() - t0).toFixed(0), clock: g.time.clock };
})()
