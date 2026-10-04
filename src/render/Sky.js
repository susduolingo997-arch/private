import * as THREE from 'three';
import { Rng } from '../core/Noise.js';
import { smoothstep, lerp, clamp, DEG } from '../core/MathUtil.js';
import { makeMoonTexture } from './Textures.js';
import { CLIMATE } from '../world/WorldDef.js';

// Colour keyframes by sun altitude (degrees): [alt, horizonHex, zenithHex]
const KEYS = [
  [-20, 0x05070f, 0x010208], [-10, 0x0c1022, 0x03051a], [-5, 0x2a2a48, 0x0a1230], [-1.5, 0x8a5560, 0x1d2b58],
  [2.5, 0xf0975f, 0x3b5f9a], [9, 0xe4c39a, 0x4a7bc0], [24, 0xc9d9ea, 0x3f78c8], [60, 0xc0d6ec, 0x2f6dc4],
];
const KC = KEYS.map(([a, h, z]) => [a, new THREE.Color(h), new THREE.Color(z)]);

function keyColors(alt, outH, outZ) {
  if (alt <= KC[0][0]) { outH.copy(KC[0][1]); outZ.copy(KC[0][2]); return; }
  for (let i = 1; i < KC.length; i++) {
    if (alt <= KC[i][0]) {
      const f = (alt - KC[i - 1][0]) / (KC[i][0] - KC[i - 1][0]);
      outH.copy(KC[i - 1][1]).lerp(KC[i][1], f); outZ.copy(KC[i - 1][2]).lerp(KC[i][2], f);
      return;
    }
  }
  outH.copy(KC[KC.length - 1][1]); outZ.copy(KC[KC.length - 1][2]);
}

const SKY_VS = /* glsl */`
varying vec3 vDir;
void main(){
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww; // always at the far plane
}`;
const SKY_FS = /* glsl */`
precision highp float;
varying vec3 vDir;
uniform vec3 uHorizon, uZenith, uSunDir, uSunColor, uSunset;
uniform float uSunVis, uSunsetAmt, uGlowAmt, uOvercast;
void main(){
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(uHorizon, uZenith, pow(h, 0.5));
  float mu = max(dot(d, uSunDir), 0.0);
  float glow = (pow(mu, 6.0) * 0.28 + pow(mu, 40.0) * 0.55 + pow(mu, 400.0) * 1.2) * uGlowAmt;
  col += uSunColor * glow;
  vec2 hz = normalize(d.xz + 1e-5), sz = normalize(uSunDir.xz + 1e-5);
  float az = pow(max(dot(hz, sz), 0.0), 1.6);
  col = mix(col, uSunset, uSunsetAmt * exp(-h * 5.5) * (0.25 + 0.75 * az));
  float disc = smoothstep(0.99985, 0.99992, mu) * uSunVis * (1.0 - uOvercast);
  col += uSunColor * disc * 60.0;
  if (d.y < 0.0) col = mix(uHorizon, uHorizon * 0.55, clamp(-d.y * 6.0, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const CLOUD_VS = /* glsl */`
varying vec3 vWP;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWP = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const CLOUD_FS = /* glsl */`
precision highp float;
varying vec3 vWP;
uniform vec3 uCam, uSunDir, uLit, uShade, uFog;
uniform float uTime, uCover, uDark;
uniform vec2 uWind;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<6;i++){ s+=a*n(p); p=p*2.03+vec2(17.3,9.1); a*=0.5; } return s; }
void main(){
  vec3 dir = vWP - uCam;
  float dist = length(dir);
  vec3 nd = dir / dist;
  if (nd.y < 0.012) discard;
  vec2 p = (vWP.xz + uWind * uTime) * 0.00042;
  float base = fbm(p);
  float detail = fbm(p * 3.7 + 4.0);
  float dens = base * 0.78 + detail * 0.22;
  float thr = mix(0.78, 0.30, uCover);
  float c = smoothstep(thr, thr + 0.20 + 0.1 * (1.0 - uCover), dens);
  // fake self-shadowing: compare density toward the sun
  vec2 sdir = normalize(uSunDir.xz + 1e-5) * 0.012 * (1.0 + (1.0 - uSunDir.y));
  float dens2 = fbm(p + sdir) * 0.78 + fbm((p + sdir) * 3.7 + 4.0) * 0.22;
  float lit = clamp(0.62 + (dens - dens2) * 5.5, 0.0, 1.0);
  lit *= mix(1.0, 0.35, uDark);
  vec3 col = mix(uShade, uLit, lit);
  col = mix(col, uShade * 0.8, uDark * smoothstep(0.35, 0.9, dens));
  // silver lining
  float mu = max(dot(nd, uSunDir), 0.0);
  col += uLit * pow(mu, 9.0) * (1.0 - c * 0.6) * 0.25 * (1.0 - uDark);
  float fade = smoothstep(0.012, 0.14, nd.y);
  col = mix(uFog, col, fade);
  float a = c * fade * smoothstep(0.0, 0.08, nd.y + 0.02);
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class SkySystem {
  constructor(scene, renderer, camera) {
    this.scene = scene; this.renderer = renderer; this.camera = camera;
    // --- sky dome ---
    this.skyUniforms = {
      uHorizon: { value: new THREE.Color() }, uZenith: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color(1, 0.9, 0.7) }, uSunset: { value: new THREE.Color(1, 0.5, 0.3) },
      uSunVis: { value: 1 }, uSunsetAmt: { value: 0 }, uGlowAmt: { value: 1 }, uOvercast: { value: 0 },
    };
    this.skyMat = new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, uniforms: this.skyUniforms, depthWrite: false, depthTest: false, side: THREE.BackSide, fog: false });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), this.skyMat);
    this.sky.frustumCulled = false; this.sky.renderOrder = -10;
    scene.add(this.sky);

    // --- stars ---
    const rng = new Rng(4242);
    const N = 2400, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const u = rng.next() * 2 - 1, th = rng.next() * Math.PI * 2, r = Math.sqrt(1 - u * u);
      pos.set([r * Math.cos(th) * 900, u * 900, r * Math.sin(th) * 900], i * 3);
      const mag = Math.pow(rng.next(), 3.0);
      const tint = rng.next();
      col.set([0.75 + tint * 0.25, 0.8 + (1 - tint) * 0.1, 1.0 - tint * 0.25], i * 3);
      for (let k = 0; k < 3; k++) col[i * 3 + k] *= 0.25 + mag * 0.9;
      size[i] = 1.2 + mag * 2.2;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    sg.setAttribute('size', new THREE.BufferAttribute(size, 1));
    this.starMat = new THREE.ShaderMaterial({
      uniforms: { uAlpha: { value: 0 }, uPx: { value: 1 } },
      vertexShader: `attribute float size; attribute vec3 color; varying vec3 vC; uniform float uPx;
        void main(){ vC = color; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; gl_PointSize = size * uPx; }`,
      fragmentShader: `varying vec3 vC; uniform float uAlpha;
        void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC * a * uAlpha, a * uAlpha); }`,
      transparent: false, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, fog: false,
    });
    this.starsInner = new THREE.Points(sg, this.starMat);
    this.starsInner.frustumCulled = false;
    this.starsOuter = new THREE.Group();
    this.starsOuter.add(this.starsInner);
    this.starsOuter.rotation.x = CLIMATE.latitude * DEG - Math.PI / 2;
    this.starsOuter.renderOrder = -9;
    this.starsInner.renderOrder = -9;
    scene.add(this.starsOuter);

    // --- moon ---
    this.moonMat = new THREE.MeshBasicMaterial({ map: makeMoonTexture(), transparent: false, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false, toneMapped: false });
    this.moon = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.moonMat);
    this.moon.renderOrder = -8; this.moon.frustumCulled = false;
    scene.add(this.moon);

    // --- clouds ---
    this.cloudUniforms = {
      uCam: { value: new THREE.Vector3() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uLit: { value: new THREE.Color(1, 1, 1) },
      uShade: { value: new THREE.Color(0.5, 0.55, 0.65) }, uFog: { value: new THREE.Color() }, uTime: { value: 0 }, uCover: { value: 0.3 },
      uDark: { value: 0 }, uWind: { value: new THREE.Vector2(8, 3) },
    };
    this.cloudMat = new THREE.ShaderMaterial({ vertexShader: CLOUD_VS, fragmentShader: CLOUD_FS, uniforms: this.cloudUniforms, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide });
    this.clouds = new THREE.Mesh(new THREE.PlaneGeometry(160000, 160000, 1, 1), this.cloudMat);
    this.clouds.rotation.x = -Math.PI / 2; this.clouds.frustumCulled = false; this.clouds.renderOrder = -7;
    scene.add(this.clouds);

    // --- lighting ---
    this.sun = new THREE.DirectionalLight(0xffffff, 3);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.00035; this.sun.shadow.normalBias = 0.08;
    scene.add(this.sun); scene.add(this.sun.target);
    this.hemi = new THREE.HemisphereLight(0xaaccff, 0x445533, 0.4);
    scene.add(this.hemi);
    this.fog = new THREE.FogExp2(0xaabbcc, 0.00025);
    scene.fog = this.fog;
    scene.background = null;
    this.shadowRadius = 70;

    // --- environment map (reflections / ambient) ---
    this.envScene = new THREE.Scene();
    this.envSky = new THREE.Mesh(new THREE.SphereGeometry(100, 24, 12), this.skyMat);
    this.envScene.add(this.envSky);
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.envTarget = null; this.envTimer = 99; this.usePmrem = true;

    // outputs for other systems
    this.sunDir = new THREE.Vector3(0, 1, 0); this.moonDir = new THREE.Vector3(0, -1, 0);
    this.sunAlt = 0; this.daylight = 1; this.night = 0;
    this.fogColor = this.fog.color;
    this.horizon = new THREE.Color();
    this._h = new THREE.Color(); this._z = new THREE.Color(); this._g = new THREE.Color();
  }

  /** Direction to a body given hour angle (deg) and declination (deg). x=east, y=up, z=south. */
  static bodyDir(Hdeg, decDeg, latDeg, out) {
    const H = Hdeg * DEG, d = decDeg * DEG, phi = latDeg * DEG;
    const sinAlt = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H);
    const alt = Math.asin(clamp(sinAlt, -1, 1));
    let cosAz = (Math.sin(d) - sinAlt * Math.sin(phi)) / (Math.cos(alt) * Math.cos(phi) + 1e-9);
    cosAz = clamp(cosAz, -1, 1);
    let az = Math.acos(cosAz);
    if (Math.sin(H) > 0) az = Math.PI * 2 - az;
    out.set(Math.sin(az) * Math.cos(alt), Math.sin(alt), -Math.cos(az) * Math.cos(alt));
    return alt;
  }

  setQuality(q) {
    this.usePmrem = q.pmrem;
    this.sun.castShadow = q.shadows;
    if (this.sun.shadow.mapSize.x !== q.shadowSize) {
      this.sun.shadow.mapSize.set(q.shadowSize, q.shadowSize);
      if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; }
    }
    this.shadowRadius = q.shadowSize >= 2048 ? 85 : 65;
    if (!q.pmrem) this.scene.environment = null;
    this.envTimer = 99;
  }

  update(dt, time, weather, playerPos) {
    const cam = this.camera;
    const hours = time.hours;
    const doy = CLIMATE.dayOfYear;
    const dec = 23.44 * Math.sin(2 * Math.PI * (doy - 81) / 365);
    const H = (hours - 12) * 15;
    const alt = SkySystem.bodyDir(H, dec, CLIMATE.latitude, this.sunDir);
    const altDeg = alt / DEG;
    this.sunAlt = altDeg;
    // moon: roughly opposite the sun, drifting ~12°/day, phase from the same drift
    const moonDrift = (time.day + hours / 24) * 12.19;
    const moonAlt = SkySystem.bodyDir(H + 180 - moonDrift + 40, 12 * Math.sin((time.day + hours / 24) * 0.23), CLIMATE.latitude, this.moonDir) / DEG;
    const phase = 0.5 - 0.5 * Math.cos((moonDrift / 360) * Math.PI * 2 * 1.0 + 0.9); // 0 new .. 1 full

    const cover = weather.cloud, rain = weather.rain, fogW = weather.fog;
    const overcast = clamp(cover * 0.85 + rain * 0.3, 0, 1);

    // --- sky colours ---
    keyColors(altDeg, this._h, this._z);
    const lum = (c) => c.r * 0.3 + c.g * 0.59 + c.b * 0.11;
    const greyAmt = clamp(Math.pow(cover, 1.5) * 0.92 + rain * 0.2, 0, 0.94);
    this._g.setRGB(lum(this._h), lum(this._h), lum(this._h)).multiplyScalar(1 - rain * 0.35 - cover * 0.15);
    this._h.lerp(this._g, greyAmt);
    this._g.setRGB(lum(this._z), lum(this._z), lum(this._z)).multiplyScalar(0.75 * (1 - rain * 0.3));
    this._z.lerp(this._g, greyAmt);
    // fog makes the whole sky milky
    if (fogW > 0.01) { this._g.setRGB(lum(this._h) * 1.05, lum(this._h) * 1.08, lum(this._h) * 1.1); this._h.lerp(this._g, fogW * 0.85); this._z.lerp(this._h, fogW * 0.7); }
    const U = this.skyUniforms;
    U.uHorizon.value.copy(this._h); U.uZenith.value.copy(this._z);
    U.uSunDir.value.copy(this.sunDir);
    const sunsetAmt = smoothstep(-8, 0, altDeg) * (1 - smoothstep(0, 12, altDeg)) * (1 - overcast * 0.8);
    U.uSunsetAmt.value = sunsetAmt;
    U.uSunset.value.setRGB(1.0, 0.36, 0.14).lerp(this._g.setRGB(0.9, 0.55, 0.45), 0.2);
    const sunHigh = smoothstep(-4, 12, altDeg);
    U.uSunColor.value.setRGB(1.0, 0.55 + 0.4 * smoothstep(0, 25, altDeg), 0.28 + 0.62 * smoothstep(0, 40, altDeg));
    U.uSunVis.value = smoothstep(-2, 1.5, altDeg);
    U.uGlowAmt.value = (1 - overcast * 0.85) * sunHigh * (1 - fogW * 0.5);
    U.uOvercast.value = overcast;

    // --- fog ---
    this.fog.color.copy(this._h);
    const hazeMorning = smoothstep(4.5, 6.5, hours) * (1 - smoothstep(7.5, 10, hours)) * 0.00012;
    this.fog.density = 0.00011 + hazeMorning + rain * 0.0011 + fogW * 0.0034 + cover * 0.00005;
    this.fogDensity = this.fog.density;

    // --- clouds ---
    const CU = this.cloudUniforms;
    CU.uCam.value.copy(cam.position);
    CU.uSunDir.value.copy(this.sunDir);
    CU.uTime.value += dt;
    CU.uCover.value = weather.cloud;
    CU.uDark.value = clamp(rain * 0.8 + weather.cloud * 0.25, 0, 1);
    CU.uWind.value.set(6 + weather.wind * 22, 2.5 + weather.wind * 6);
    CU.uFog.value.copy(this._h);
    const dayLight = smoothstep(-6, 8, altDeg);
    // lit cloud colour: white-gold at sunset, white at day, dim blue-grey at night
    CU.uLit.value.setRGB(1, 0.62 + 0.38 * smoothstep(0, 22, altDeg), 0.42 + 0.58 * smoothstep(0, 35, altDeg)).multiplyScalar(0.1 + 1.05 * dayLight);
    CU.uShade.value.copy(this._z).lerp(this._g.setRGB(0.42, 0.46, 0.56), 0.6).multiplyScalar(0.25 + 0.9 * dayLight);
    this.clouds.position.set(cam.position.x, 1900, cam.position.z);

    // --- stars + moon ---
    const nightAmt = 1 - smoothstep(-14, -3, altDeg);
    this.night = nightAmt;
    this.starMat.uniforms.uAlpha.value = nightAmt * (1 - overcast * 0.95) * (1 - fogW * 0.7);
    this.starMat.uniforms.uPx.value = this.renderer.getPixelRatio();
    this.starsInner.rotation.y = -(hours * 15 + time.day * 360.9856 * 0) * DEG;
    this.starsOuter.position.copy(cam.position);
    this.sky.position.copy(cam.position);
    this.envSky.position.set(0, 0, 0);
    const moonUp = smoothstep(-4, 6, moonAlt);
    this.moon.position.copy(cam.position).addScaledVector(this.moonDir, 800);
    this.moon.scale.setScalar(52);
    this.moon.quaternion.copy(cam.quaternion);
    this.moon.visible = moonUp > 0.01;
    this.moonMat.color.setScalar(clamp(moonUp * (0.4 + 0.6 * phase) * (1 - overcast * 0.9) * (1 - smoothstep(-6, 6, altDeg) * 0.97), 0, 1.4));
    this.moonLight = moonUp * (0.25 + 0.75 * phase) * (1 - overcast * 0.55);

    // --- key light: sun by day, moon by night (one shadow-casting light) ---
    const sinAlt = Math.sin(alt);
    const sunI = 3.0 * smoothstep(-0.015, 0.2, sinAlt) * (1 - overcast * 0.78) * (1 - fogW * 0.45);
    const moonI = 0.42 * this.moonLight * smoothstep(0.5 * DEG * -1, -6, altDeg * 1) ;
    void moonI;
    const useSun = altDeg > -0.8;
    const moonFactor = this.moonLight * (1 - smoothstep(-6, -0.8, altDeg));
    const keyI = useSun ? sunI : 0.55 * moonFactor;
    const dir = useSun ? this.sunDir : this.moonDir;
    this.sun.intensity = keyI;
    // sun colour warms near the horizon
    if (useSun) this.sun.color.setRGB(1.0, 0.62 + 0.36 * smoothstep(0, 22, altDeg), 0.38 + 0.6 * smoothstep(0, 35, altDeg));
    else this.sun.color.setRGB(0.55, 0.65, 1.0);
    const snap = (2 * this.shadowRadius) / this.sun.shadow.mapSize.x;
    const tx = Math.round(playerPos.x / snap) * snap, tz = Math.round(playerPos.z / snap) * snap;
    this.sun.target.position.set(tx, playerPos.y, tz);
    this.sun.position.set(tx + dir.x * 300, playerPos.y + dir.y * 300, tz + dir.z * 300);
    const sc = this.sun.shadow.camera;
    const R = this.shadowRadius;
    if (sc.right !== R) { sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 10; sc.far = 700; sc.updateProjectionMatrix(); }
    this.sun.shadow.camera.updateMatrixWorld();

    // --- ambient ---
    this.hemi.color.copy(this._z).lerp(this._h, 0.35).multiplyScalar(1.0);
    this.hemi.groundColor.setRGB(0.20, 0.18, 0.14).multiplyScalar(0.3 + 0.7 * dayLight);
    const ambDay = 0.55 * dayLight;
    const ambNight = 0.045 + 0.1 * moonFactor;
    this.hemi.intensity = (this.scene.environment ? 0.18 : 0.75) * ambDay + ambNight * (this.scene.environment ? 0.7 : 1.0) * 3.0;
    this.daylight = dayLight;
    if (this.scene.environment !== undefined) this.scene.environmentIntensity = 0.1 + 0.95 * dayLight * (1 - overcast * 0.2);

    // periodic environment refresh
    this.envTimer += dt;
    if (this.usePmrem && this.envTimer > 4) {
      this.envTimer = 0;
      const old = this.envTarget;
      this.envTarget = this.pmrem.fromScene(this.envScene, 0, 1, 500);
      this.scene.environment = this.envTarget.texture;
      if (old) old.dispose();
    }
    // exposure curve (applied by Post): bright day ~1, deep night much higher
    this.exposure = lerp(3.2, 0.82, dayLight) * lerp(1, 1.12, overcast) * (1 + sunsetAmt * 0.2);
    this.exposure *= lerp(1.0, 1.0, 1);
  }
}
