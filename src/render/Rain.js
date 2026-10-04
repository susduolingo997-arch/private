import * as THREE from 'three';
import { G } from './Materials.js';

/**
 * Rain streaks simulated entirely on the GPU in a box that follows the camera. They are
 * real world-space geometry (depth tested, fogged by distance), not a screen overlay.
 */
export class Rain {
  constructor(scene) {
    this.N = 6000;
    const N = this.N;
    const pos = new Float32Array(N * 2 * 3), seed = new Float32Array(N * 2), end = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      const x = Math.random() * 40 - 20, y = Math.random() * 26, z = Math.random() * 40 - 20, s = Math.random();
      for (let k = 0; k < 2; k++) { pos.set([x, y, z], (i * 2 + k) * 3); seed[i * 2 + k] = s; end[i * 2 + k] = k; }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
    this.uniforms = {
      uTime: G.uTime, uCam: { value: new THREE.Vector3() }, uWind: { value: new THREE.Vector2(0.3, 0.1) },
      uAlpha: { value: 0 }, uFogColor: { value: new THREE.Color(0.7, 0.75, 0.8) },
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, transparent: true, depthWrite: false, fog: false,
      vertexShader: `
        attribute float aSeed; attribute float aEnd; uniform float uTime; uniform vec3 uCam; uniform vec2 uWind;
        varying float vA;
        void main(){
          float speed = 11.0 + aSeed * 4.0;
          vec3 p = position;
          p.y = mod(p.y - uTime * speed, 26.0);
          p.xz += uWind * (26.0 - p.y) * 0.4;
          vec3 base = vec3(uCam.x + mod(p.x - uCam.x + 20.0, 40.0) - 20.0, p.y + uCam.y - 8.0, uCam.z + mod(p.z - uCam.z + 20.0, 40.0) - 20.0);
          base.y = uCam.y - 6.0 + mod(p.y, 26.0);
          vec3 streak = vec3(-uWind.x, 1.0, -uWind.y) * (0.35 + aSeed * 0.2) * aEnd;
          vec4 mv = viewMatrix * vec4(base + streak, 1.0);
          float d = length(mv.xyz);
          vA = (1.0 - smoothstep(14.0, 26.0, d)) * smoothstep(0.6, 2.0, d);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `uniform float uAlpha; uniform vec3 uFogColor; varying float vA;
        void main(){ gl_FragColor = vec4(mix(uFogColor, vec3(0.8, 0.85, 0.9), 0.35), vA * uAlpha * 0.22); }`,
    });
    this.mesh = new THREE.LineSegments(g, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  update(camera, rain, windX, windZ, fogColor) {
    this.mesh.visible = rain > 0.04;
    if (!this.mesh.visible) return;
    this.uniforms.uCam.value.copy(camera.position);
    this.uniforms.uAlpha.value = Math.min(1, rain * 1.2);
    this.uniforms.uWind.value.set(windX * 0.35, windZ * 0.35);
    this.uniforms.uFogColor.value.copy(fogColor);
    this.mesh.geometry.setDrawRange(0, Math.floor(this.N * 2 * Math.min(1, 0.12 + rain)));
  }
}
