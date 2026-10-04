// Auto-save. The world itself is a pure function of its seed, so the save only needs
// the few pieces of state that actually change: where the player is, what time and
// weather it is, which doors are open and where the traffic currently is.
const KEY = 'tlwh_save_v1';
export const SAVE_VERSION = 1;

export const SaveSystem = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      return d && d.version === SAVE_VERSION ? d : null;
    } catch (e) { return null; }
  },
  save(data) {
    try { localStorage.setItem(KEY, JSON.stringify({ version: SAVE_VERSION, ...data })); return true; }
    catch (e) { return false; }
  },
  clear() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } },
};
