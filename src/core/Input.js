/** Keyboard + mouse (pointer lock) input. */
export class Input {
  constructor(dom) {
    this.dom = dom;
    this.keys = new Set();
    this.dx = 0; this.dy = 0;
    this.locked = false;
    this.onLockChange = null;
    this.pressed = new Set(); // one-shot key presses since last frame
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code); this.pressed.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code) && this.locked) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
    window.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.dx += e.movementX || 0; this.dy += e.movementY || 0;
    });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.dom;
      if (!this.locked) this.keys.clear();
      if (this.onLockChange) this.onLockChange(this.locked);
    });
  }
  lock() { try { const p = this.dom.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignore */ } }
  unlock() { if (document.pointerLockElement) document.exitPointerLock(); }
  down(code) { return this.keys.has(code); }
  consume() { const d = { dx: this.dx, dy: this.dy }; this.dx = 0; this.dy = 0; return d; }
  wasPressed(code) { return this.pressed.has(code); }
  endFrame() { this.pressed.clear(); }
}
