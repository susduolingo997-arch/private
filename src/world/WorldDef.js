// Hand-authored skeleton of the world. Everything else (hills, forests, houses,
// fences, poles…) is derived deterministically from this + the noise seed.
//
// Coordinates: x = east, z = south (so *north* is -z), y = up, metres.
// The prototype covers roughly 1.8 km from the start to home, but nothing here is a
// boundary: terrain, forests and weather are infinite functions, and the road
// network simply continues off into unexplored country for future expansion.

export const WORLD_SEED = 20240611;

export const START = { x: 6, z: 46, yaw: 0 }; // yaw 0 = looking north (-z)

// Where the day begins
export const START_TIME = { day: 0, hours: 6.75 };
// Used for the sun's path: day-of-year (frozen unless Seasons is enabled) and latitude.
export const CLIMATE = { dayOfYear: 150, latitude: 47 };

// Centre of the "journey valley": mountains rise away from here.
export const VALLEY = { x: 150, z: -900 };

// type: paved | street | lane | dirt | trail
export const ROAD_DEFS = [
  {
    id: 'track', type: 'dirt', name: 'Old Farm Track',
    pts: [[8, 90], [6, 20], [4, -40], [22, -110], [34, -190], [14, -290], [-28, -390], [-52, -480], [-60, -560]],
    joinEnd: 'county',
  },
  {
    id: 'county', type: 'paved', name: 'County Road',
    pts: [[-720, -500], [-520, -575], [-300, -585], [-90, -572], [90, -625], [235, -760], [310, -930], [330, -1090],
          [318, -1230], [306, -1330], [300, -1445], [262, -1600], [190, -1780], [140, -1960], [130, -2250], [150, -2600], [200, -3100]],
  },
  {
    id: 'farmlane', type: 'dirt', name: 'Farm Lane', width: 3.0,
    pts: [[-26, -392], [-70, -372], [-112, -338], [-138, -322]],
    joinStart: 'track',
  },
  {
    id: 'forest_trail', type: 'trail', name: 'Forest Trail',
    pts: [[27, -185], [78, -226], [135, -296], [176, -380], [205, -470], [196, -565], [172, -655], [160, -700]],
    joinStart: 'track', joinEnd: 'county',
  },
  {
    id: 'mill', type: 'street', name: 'Mill Lane',
    pts: [[310, -1292], [372, -1296], [442, -1318], [520, -1352]],
    joinStart: 'county',
  },
  {
    id: 'church', type: 'street', name: 'Church Street',
    pts: [[305, -1388], [238, -1396], [170, -1420], [96, -1446]],
    joinStart: 'county',
  },
  {
    id: 'orchard', type: 'street', name: 'Orchard Road',
    pts: [[304, -1236], [236, -1226], [170, -1196]],
    joinStart: 'county',
  },
  {
    id: 'homelane', type: 'lane', name: 'Home Lane',
    pts: [[301, -1478], [362, -1494], [428, -1478], [496, -1500], [548, -1554]],
    joinStart: 'county',
  },
  {
    id: 'hamlet', type: 'lane', name: 'Wren Lane',
    pts: [[-300, -588], [-318, -650], [-345, -720]],
    joinStart: 'county',
  },
];

export const ROAD_TYPES = {
  paved:  { width: 6.4, shoulder: 1.1, falloff: 11, ditch: true,  surface: 'asphalt', smooth: 16 },
  street: { width: 5.6, shoulder: 0.9, falloff: 8,  ditch: false, surface: 'asphalt', smooth: 10 },
  lane:   { width: 4.4, shoulder: 0.8, falloff: 7,  ditch: true,  surface: 'asphalt', smooth: 10 },
  dirt:   { width: 3.4, shoulder: 0.6, falloff: 5,  ditch: false, surface: 'dirt',    smooth: 6 },
  trail:  { width: 1.3, shoulder: 0.5, falloff: 3,  ditch: false, surface: 'dirt',    smooth: 3 },
};

export const RIVER_DEFS = [
  {
    id: 'mill_river', name: 'River Aln', half: 4.2,
    pts: [[1000, -1280], [760, -1170], [600, -1095], [450, -1078], [330, -1090], [180, -1112], [30, -1075],
          [-130, -1085], [-330, -1170], [-560, -1160], [-900, -1060]],
  },
];

// Crop / pasture fields (rotated rectangles)
export const FIELDS = [
  { id: 'f1', cx: -92, cz: -105, hw: 58, hd: 92, ang: 0.08, kind: 'wheat' },
  { id: 'f2', cx: 100, cz: -95, hw: 60, hd: 78, ang: -0.12, kind: 'barley' },
  { id: 'f3', cx: -112, cz: -470, hw: 62, hd: 52, ang: 0.18, kind: 'plowed' },
  { id: 'f4', cx: 80, cz: -400, hw: 46, hd: 70, ang: 0.3, kind: 'hay' },
  { id: 'p1', cx: -118, cz: -232, hw: 48, hd: 42, ang: 0.05, kind: 'pasture' },
  { id: 'f5', cx: -330, cz: -480, hw: 80, hd: 60, ang: -0.2, kind: 'barley' },
  { id: 'f6', cx: 420, cz: -1000, hw: 90, hd: 50, ang: 0.1, kind: 'wheat' },
  { id: 'p2', cx: 130, cz: -1250, hw: 60, hd: 36, ang: -0.1, kind: 'pasture' },
];

// Woodland (soft-edged ellipses). Further woods come from noise.
export const FORESTS = [
  { cx: 130, cz: -905, rx: 330, rz: 215, ang: 0.35, density: 1.0 },
  { cx: -230, cz: -20, rx: 95, rz: 65, ang: 0.3, density: 0.9 },
  { cx: 215, cz: -190, rx: 80, rz: 110, ang: -0.1, density: 0.8 },
  { cx: -340, cz: -300, rx: 140, rz: 90, ang: 0.6, density: 0.85 },
  { cx: 520, cz: -700, rx: 200, rz: 130, ang: -0.4, density: 0.85 },
  { cx: 80, cz: -1620, rx: 220, rz: 180, ang: 0.2, density: 0.9 },
  { cx: 560, cz: -1760, rx: 150, rz: 100, ang: 0.1, density: 0.8 },
];

// Hamlet / village zones used to place houses along roads.
export const SETTLEMENTS = [
  { id: 'millbrook', name: 'Millbrook', cx: 308, cz: -1345, r: 175, spacing: 25, prob: 0.82, kind: 'village' },
  { id: 'wren', name: 'Wren End', cx: -310, cz: -640, r: 90, spacing: 55, prob: 0.55, kind: 'hamlet' },
  { id: 'roadside', name: 'Roadside', cx: 150, cz: -690, r: 60, spacing: 80, prob: 0.6, kind: 'hamlet' },
  { id: 'lane', name: 'Home Lane', cx: 430, cz: -1480, r: 90, spacing: 58, prob: 0.5, kind: 'hamlet' },
];

// Signposts: [x, z, facing, text lines]. Facing is the yaw the sign face looks toward.
export const SIGNS = [
  { x: 14, z: -4, rot: 0, lines: ['Coles Farm  0.5 km', 'County Road  0.6 km'], kind: 'wood' },
  { x: 38, z: -176, rot: 0.6, lines: ['Forest Trail  ➜', 'Farm Track  ↑'], kind: 'wood' },
  { x: -52, z: -566, rot: 0, lines: ['Millbrook  1.0 km ↗', 'Wren End  0.3 km ←'], kind: 'road' },
  { x: 315, z: -1180, rot: Math.PI, lines: ['Millbrook', 'Please drive carefully'], kind: 'road' },
];
