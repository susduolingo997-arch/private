import * as THREE from 'three';

/**
 * Minimal post pipeline: scene -> HDR render target -> one full-screen pass that does
 * ACES tone mapping, a gentle bloom-ish glow term from a downsampled copy, vignette and
 * a hint of film grain. (Low quality skips all of it and renders straight to screen.)
 */
const FS = /* glsl */`
precision highp float;
uniform sampler2D tScene;
uniform sampler2D tBlur;
uniform float uExposure, uTime, uVignette, uGrain, uBloom, uWet;
uniform vec2 uRes;
varying vec2 vUv;
vec3 RRT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
vec3 aces(vec3 c){
  const mat3 I = mat3(vec3(0.59719,0.07600,0.02840), vec3(0.35458,0.90834,0.13383), vec3(0.04823,0.01566,0.83777));
  const mat3 O = mat3(vec3(1.60475,-0.10208,-0.00327), vec3(-0.53108,1.10813,-0.07276), vec3(-0.07367,-0.00605,1.07602));
  c *= uExposure / 0.6; c = I * c; c = RRT(c); c = O * c; return clamp(c, 0.0, 1.0);
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec3 c = texture2D(tScene, vUv).rgb;
  vec3 b = texture2D(tBlur, vUv).rgb;
  c += b * uBloom;
  c = aces(c);
  // mild contrast / saturation grade
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, 1.06);
  c = toSRGB(c);
  c = mix(c, c * c * (3.0 - 2.0 * c), 0.12);
  vec2 q = vUv - 0.5;
  float v = 1.0 - dot(q, q) * uVignette;
  c *= clamp(v, 0.0, 1.0);
  c += (hash(vUv * uRes + uTime) - 0.5) * uGrain;
  gl_FragColor = vec4(c, 1.0);
}`;
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const BLUR_FS = /* glsl */`
precision highp float;
uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv; uniform float uThresh;
void main(){
  vec3 s = vec3(0.0);
  float w[5]; w[0]=0.227; w[1]=0.194; w[2]=0.121; w[3]=0.054; w[4]=0.016;
  vec3 c0 = texture2D(tSrc, vUv).rgb;
  c0 = max(c0 - uThresh, 0.0);
  s += c0 * w[0];
  for (int i = 1; i < 5; i++) {
    vec3 a = max(texture2D(tSrc, vUv + uDir * float(i)).rgb - uThresh, 0.0);
    vec3 b = max(texture2D(tSrc, vUv - uDir * float(i)).rgb - uThresh, 0.0);
    s += (a + b) * w[i];
  }
  gl_FragColor = vec4(s, 1.0);
}`;
const BLUR2_FS = BLUR_FS.replace('c0 = max(c0 - uThresh, 0.0);', '').replaceAll('max(texture2D(tSrc, vUv + uDir * float(i)).rgb - uThresh, 0.0)', 'texture2D(tSrc, vUv + uDir * float(i)).rgb').replaceAll('max(texture2D(tSrc, vUv - uDir * float(i)).rgb - uThresh, 0.0)', 'texture2D(tSrc, vUv - uDir * float(i)).rgb');

export class Post {
  constructor(renderer) {
    this.renderer = renderer;
    this.enabled = true;
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    this.quad.frustumCulled = false;
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene(); this.scene.add(this.quad);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VS, fragmentShader: FS, depthTest: false, depthWrite: false,
      uniforms: { tScene: { value: null }, tBlur: { value: null }, uExposure: { value: 1 }, uTime: { value: 0 }, uVignette: { value: 0.55 }, uGrain: { value: 0.018 }, uBloom: { value: 0.35 }, uRes: { value: new THREE.Vector2(1, 1) }, uWet: { value: 0 } },
    });
    this.blurH = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: BLUR_FS, depthTest: false, depthWrite: false, uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2() }, uThresh: { value: 1.2 } } });
    this.blurV = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: BLUR2_FS, depthTest: false, depthWrite: false, uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } } });
    this.rt = null; this.rtA = null; this.rtB = null;
    this.samples = 4;
  }

  setQuality(q) {
    const r = this.renderer, ext = r.extensions;
    // HDR (half-float) render targets need EXT_color_buffer_*; without them render straight to screen.
    const hdrOk = r.capabilities.isWebGL2 && (ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float'));
    this.samples = Math.min(q.msaa, r.capabilities.maxSamples || 4);
    this.enabled = q.msaa > 0 && hdrOk;
    this.dispose(); // recreate lazily
  }

  dispose() {
    for (const t of [this.rt, this.rtA, this.rtB]) if (t) t.dispose();
    this.rt = this.rtA = this.rtB = null;
  }

  resize(w, h) { this.w = w; this.h = h; this.dispose(); }

  _ensure() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    if (this.rt && this.rt.width === size.x && this.rt.height === size.y) return;
    this.dispose();
    this.rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: this.samples, depthBuffer: true });
    const bw = Math.max(2, size.x >> 2), bh = Math.max(2, size.y >> 2);
    this.rtA = new THREE.WebGLRenderTarget(bw, bh, { type: THREE.HalfFloatType });
    this.rtB = new THREE.WebGLRenderTarget(bw, bh, { type: THREE.HalfFloatType });
    this.mat.uniforms.uRes.value.set(size.x, size.y);
  }

  render(scene, camera, exposure, time, night) {
    const r = this.renderer;
    if (!this.enabled) { r.toneMappingExposure = exposure; r.setRenderTarget(null); r.render(scene, camera); return; }
    this._ensure();
    r.setRenderTarget(this.rt);
    r.clear();
    r.render(scene, camera);
    // bloom (bright parts only, quarter res)
    this.quad.material = this.blurH;
    this.blurH.uniforms.tSrc.value = this.rt.texture;
    this.blurH.uniforms.uDir.value.set(1.5 / this.rtA.width, 0);
    this.blurH.uniforms.uThresh.value = 1.0 / Math.max(0.05, exposure) * 0.9 + 0.4;
    r.setRenderTarget(this.rtA); r.render(this.scene, this.cam);
    this.quad.material = this.blurV;
    this.blurV.uniforms.tSrc.value = this.rtA.texture;
    this.blurV.uniforms.uDir.value.set(0, 1.5 / this.rtB.height);
    r.setRenderTarget(this.rtB); r.render(this.scene, this.cam);
    // composite
    this.quad.material = this.mat;
    this.mat.uniforms.tScene.value = this.rt.texture;
    this.mat.uniforms.tBlur.value = this.rtB.texture;
    this.mat.uniforms.uExposure.value = exposure;
    this.mat.uniforms.uTime.value = (time * 7.13) % 100;
    this.mat.uniforms.uBloom.value = 0.22 + night * 0.35;
    r.setRenderTarget(null);
    r.render(this.scene, this.cam);
  }
}
