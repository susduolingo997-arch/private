import * as THREE from 'three';
import { makeDetailTexture, makeRoadTexture, makeDirtTexture, makeRailTexture } from './Textures.js';

/**
 * Global shader uniforms, updated once per frame by the weather / sky systems and
 * shared by every material — one rainstorm wets the whole world at once.
 */
export const G = {
  uTime: { value: 0 },
  uWet: { value: 0 },      // 0 dry .. 1 soaked (lags behind rain)
  uRain: { value: 0 },     // current rain intensity
  uWind: { value: 0.2 },
  uGlow: { value: 0 },     // 0..1 how many windows are lit
  uNight: { value: 0 },
  uSeason: { value: new THREE.Vector3(1, 1, 1) }, // foliage tint (seasons hook)
  uPlayer: { value: new THREE.Vector3() },
  uFar: { value: 320 },     // distance at which streamed trees finish fading in
};

const NOISE_GLSL = /* glsl */`
float tl_h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float tl_n(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(tl_h(i), tl_h(i+vec2(1,0)), f.x), mix(tl_h(i+vec2(0,1)), tl_h(i+vec2(1,1)), f.x), f.y);
}
`;

/**
 * Patch a MeshStandardMaterial with: world position varyings, wetness (darker, glossier,
 * puddles with rain ripples), optional wind sway, optional terrain detail + field rows.
 */
function patch(mat, o = {}) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = G.uTime; shader.uniforms.uWet = G.uWet; shader.uniforms.uRain = G.uRain;
    shader.uniforms.uWind = G.uWind; shader.uniforms.uSeason = G.uSeason; shader.uniforms.uGlow = G.uGlow;
    shader.uniforms.uPlayer = G.uPlayer; shader.uniforms.uFar = G.uFar;
    if (o.detail) shader.uniforms.uDetail = { value: o.detail };

    let vs = shader.vertexShader;
    vs = vs.replace('#include <common>', `#include <common>
      varying vec3 vWPos; varying float vWUp;
      uniform float uTime; uniform float uWind; uniform vec3 uPlayer; uniform float uFar;
      ${o.terrain ? 'attribute vec4 aSurf; varying vec4 vSurf;' : ''}
      ${o.lit ? 'attribute float aLit; varying float vLit;' : ''}
    `);
    vs = vs.replace('#include <begin_vertex>', `#include <begin_vertex>
      ${o.terrain ? 'vSurf = aSurf;' : ''}
      ${o.lit ? 'vLit = aLit;' : ''}
      ${o.sway ? `
      {
        #ifdef USE_INSTANCING
          vec4 tl_iw = modelMatrix * (instanceMatrix * vec4(0.0,0.0,0.0,1.0));
        #else
          vec4 tl_iw = modelMatrix * vec4(0.0,0.0,0.0,1.0);
        #endif
        float tl_ph = tl_iw.x * 0.21 + tl_iw.z * 0.17;
        float tl_h = max(position.y, 0.0);
        float tl_g = (sin(uTime * 1.7 + tl_ph) * 0.6 + sin(uTime * 3.1 + tl_ph * 1.9) * 0.4) * (0.35 + uWind * 1.25);
        float tl_k = ${o.swayK || '0.012'} * tl_h * ${o.swayH || '1.0'};
        transformed.x += tl_g * tl_k;
        transformed.z += tl_g * tl_k * 0.6;
        ${o.fade ? `
        // grass blades shrink away with distance so there is never a visible pop
        float tl_d = distance(tl_iw.xz, uPlayer.xz);
        float tl_s = 1.0 - smoothstep(${o.fade[0].toFixed(1)}, ${o.fade[1].toFixed(1)}, tl_d);
        transformed.y *= tl_s; transformed.x *= tl_s; transformed.z *= tl_s;` : ''}
        ${o.farFade ? `float tl_s2 = 1.0 - smoothstep(uFar - 55.0, uFar, distance(tl_iw.xz, uPlayer.xz)); transformed *= tl_s2;` : ''}
      }` : ''}
      {
        vec4 tl_wp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          tl_wp = instanceMatrix * tl_wp;
        #endif
        vWPos = (modelMatrix * tl_wp).xyz;
        vWUp = (modelMatrix * vec4(objectNormal, 0.0)).y;
      }
    `);
    shader.vertexShader = vs;

    let fs = shader.fragmentShader;
    fs = fs.replace('#include <common>', `#include <common>
      varying vec3 vWPos; varying float vWUp;
      uniform float uWet; uniform float uRain; uniform float uTime;
      ${o.detail ? 'uniform sampler2D uDetail;' : ''}
      ${o.terrain ? 'varying vec4 vSurf;' : ''}
      ${o.lit ? 'varying float vLit; uniform float uGlow;' : ''}
      ${o.leaf ? 'uniform vec3 uSeason;' : ''}
      ${NOISE_GLSL}
    `);
    fs = fs.replace('#include <color_fragment>', `#include <color_fragment>
      float tl_puddle = 0.0;
      float tl_wetMask = uWet;
      ${o.detail && !o.dapple ? `
      {
        float dA = texture2D(uDetail, vWPos.xz * 0.37).r;
        float dB = texture2D(uDetail, vWPos.xz * 0.029).g;
        float dC = texture2D(uDetail, vWPos.xz * 1.9).b;
        float dD = texture2D(uDetail, vWPos.xz * 7.3 + 0.37).b;
        diffuseColor.rgb *= (0.72 + 0.56 * dA) * (0.86 + 0.3 * dB) * (0.9 + 0.2 * dC) * (0.9 + 0.2 * dD);
      }` : ''}
      ${o.terrain ? `
      {
        float ca = cos(vSurf.y), sa = sin(vSurf.y);
        float st = sin(dot(vWPos.xz, vec2(-sa, ca)) * 5.2);
        float st2 = sin(dot(vWPos.xz, vec2(-sa, ca)) * 1.9 + 1.0);
        float fw = clamp(vSurf.x, 0.0, 1.5);
        diffuseColor.rgb *= 1.0 + fw * (0.13 * st + 0.07 * st2);
      }` : ''}
      ${o.dapple ? `{ float dd = texture2D(uDetail, vWPos.xz * 0.9 + vWPos.y * 0.6).r * 0.6 + texture2D(uDetail, vWPos.xz * 3.1 - vWPos.y * 1.7).b * 0.4; diffuseColor.rgb *= 0.62 + 0.9 * dd; }` : ''}
      ${o.leaf ? `diffuseColor.rgb *= uSeason; diffuseColor.rgb *= mix(1.0, 0.72, uWet);` : ''}
      ${o.puddles ? `
      {
        float pn = tl_n(vWPos.xz * 0.21) * 0.6 + tl_n(vWPos.xz * 0.77) * 0.4;
        float flatness = smoothstep(0.94, 0.995, vWUp);
        tl_puddle = smoothstep(0.64 - 0.10 * uWet, 0.72, pn) * smoothstep(0.35, 0.8, uWet) * flatness;
        ${o.terrain ? 'tl_puddle *= (1.0 - clamp(vSurf.z * 2.0, 0.0, 1.0));' : ''}
        float dark = mix(1.0, 0.64, uWet) * mix(1.0, 0.62, tl_puddle);
        diffuseColor.rgb *= dark;
      }` : `diffuseColor.rgb *= mix(1.0, 0.8, uWet);`}
      ${o.glass ? `diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.02,0.03,0.04), 0.7);` : ''}
    `);
    fs = fs.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.55, uWet);
      ${o.puddles ? 'roughnessFactor = mix(roughnessFactor, 0.025, tl_puddle);' : ''}
      ${o.glass ? 'roughnessFactor = 0.06;' : ''}
    `);
    if (o.puddles) {
      fs = fs.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if (tl_puddle > 0.01 && uRain > 0.05) {
          // concentric rain ripples perturb the normal inside puddles
          vec2 rp = vWPos.xz * 3.1;
          vec2 cell = floor(rp), lp = fract(rp) - 0.5;
          float ph = tl_h(cell);
          float t = fract(uTime * (0.7 + ph * 0.5) + ph);
          float rr = length(lp);
          float ring = sin((rr - t * 0.5) * 38.0) * smoothstep(0.5, 0.0, abs(rr - t * 0.5)) * (1.0 - t);
          vec3 vd = normalize(vec3(lp.x, 0.0, lp.y));
          normal = normalize(normal + (viewMatrix * vec4(vd, 0.0)).xyz * ring * 0.05 * uRain * tl_puddle);
        }
      `);
    }
    if (o.lit) {
      fs = fs.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float tl_on = smoothstep(vLit - 0.06, vLit + 0.06, uGlow);
        totalEmissiveRadiance += vec3(1.0, 0.72, 0.38) * tl_on * 2.4;
      `);
    }
    shader.fragmentShader = fs;
  };
  mat.customProgramCacheKey = () => JSON.stringify(o, (k, v) => (v && v.isTexture ? 'tex' : v));
  return mat;
}

let _detail = null;
const detailTex = () => (_detail || (_detail = makeDetailTexture()));

export const Mats = {};

export function initMaterials() {
  Mats.terrain = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, metalness: 0, envMapIntensity: 0.55 }),
    { detail: detailTex(), terrain: true, puddles: true });
  Mats.distant = new THREE.MeshLambertMaterial({ vertexColors: true });
  Mats.building = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 }), { detail: detailTex() });
  Mats.prop = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.0 }), {});
  Mats.metal = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.7 }), {});
  Mats.glass = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.06, metalness: 0.0, side: THREE.DoubleSide }), { lit: true, glass: true });
  Mats.foliage = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 }),
    { sway: true, leaf: true, swayK: '0.0105', swayH: '1.0', detail: detailTex(), dapple: true, farFade: true });
  Mats.grass = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, side: THREE.DoubleSide }),
    { sway: true, leaf: true, swayK: '0.16', swayH: '1.0', fade: [38, 76] });
  Mats.crop = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, side: THREE.DoubleSide }),
    { sway: true, leaf: false, swayK: '0.12', fade: [30, 62] });
  Mats.car = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.55 }), {});
  Mats.carLights = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true });
  Mats.person = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), {});
  Mats.animal = patch(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }), {});
  Mats.emissiveLamp = new THREE.MeshBasicMaterial({ color: 0xfff1c9 });
  Mats.wires = new THREE.LineBasicMaterial({ color: 0x1a1a1c });
  Mats.sig = [0xff2a1a, 0xffa31a, 0x2aff55].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  Mats.terrain.side = THREE.DoubleSide;

  // Roads
  const mk = (tex, extra = {}) => patch(new THREE.MeshStandardMaterial({
    map: tex, alphaTest: 0.5, roughness: 1.0, metalness: 0, envMapIntensity: 0.4, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, ...extra,
  }), { puddles: true, detail: detailTex() });
  Mats.roadTex = {
    paved: makeRoadTexture({ width: 6.4, shoulder: 1.1, centre: 'dash', edges: true, seed: 3 }),
    street: makeRoadTexture({ width: 5.6, shoulder: 0.9, centre: 'dash', edges: false, seed: 4 }),
    lane: makeRoadTexture({ width: 4.4, shoulder: 0.8, centre: 'none', edges: false, seed: 5 }),
    dirt: makeDirtTexture({ width: 3.4, seed: 9 }),
    farm: makeDirtTexture({ width: 3.0, seed: 10 }),
    trail: makeDirtTexture({ width: 1.3, trail: true, seed: 11 }),
    drive: makeDirtTexture({ width: 3.0, trail: true, seed: 12 }),
    rail: makeRailTexture({ width: 4.2 }),
  };
  Mats.road = {};
  for (const k of Object.keys(Mats.roadTex)) Mats.road[k] = mk(Mats.roadTex[k]);

  // Rivers: dark, glossy, gently rippling
  Mats.water = new THREE.MeshStandardMaterial({
    color: 0xffffff, vertexColors: true, roughness: 0.05, metalness: 0.0, transparent: true, opacity: 1.0, depthWrite: false,
  });
  Mats.water.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = G.uTime;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos2; varying vec2 vUv2;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWPos2 = (modelMatrix * vec4(transformed,1.0)).xyz; vUv2 = uv;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWPos2; varying vec2 vUv2; uniform float uTime;
      ${NOISE_GLSL}`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        {
          vec2 p = vec2(vUv2.x * 14.0, vUv2.y * 0.45 - uTime * 0.9);
          float e = 0.02;
          float h0 = tl_n(p * vec2(1.0, 1.0)) + tl_n(p * 2.3 + 7.0) * 0.5;
          float hx = tl_n((p + vec2(e, 0.0))) + tl_n((p + vec2(e, 0.0)) * 2.3 + 7.0) * 0.5;
          float hy = tl_n((p + vec2(0.0, e))) + tl_n((p + vec2(0.0, e)) * 2.3 + 7.0) * 0.5;
          vec3 pert = vec3((hx - h0) / e, 0.0, (hy - h0) / e) * 0.012;
          normal = normalize(normal + (viewMatrix * vec4(pert, 0.0)).xyz);
        }`);
  };
  Mats.water.customProgramCacheKey = () => 'water';
}

export const Detail = detailTex;
