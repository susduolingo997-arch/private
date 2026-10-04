export const CHUNK = 64;           // metres per chunk edge — internal streaming unit only
export const chunkKey = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);
export const chunkOf = (v) => Math.floor(v / CHUNK);
