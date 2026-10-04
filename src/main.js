import { Game } from './core/Game.js';

const game = new Game(document.getElementById('game'));
window.__game = game; // handy for debugging in the console
game.init().catch((e) => { console.error(e); document.body.insertAdjacentHTML('beforeend', `<pre style="position:fixed;top:0;left:0;color:#f88;background:#000;padding:8px;z-index:99">${e.stack || e}</pre>`); });
