import { Terrain } from '../src/world/Terrain.js';
import { RoadNetwork } from '../src/world/Roads.js';
import { RiverNetwork } from '../src/world/Rivers.js';
import { ROAD_DEFS, ROAD_TYPES, RIVER_DEFS } from '../src/world/WorldDef.js';
const t = new Terrain();
const rivers = new RiverNetwork(RIVER_DEFS, t);
const roads = new RoadNetwork(ROAD_DEFS, ROAD_TYPES, t);
roads.computeBridges(rivers); roads.finalize();
t.attach(roads, rivers);
console.log('bridges', roads.bridges.map(b=>[b.road.id,b.a,b.b,b.level.toFixed(1),b.length.toFixed(0)]));
for (const r of roads.roads) console.log(r.id, 'len', r.length.toFixed(0), 'elev', r.elev[0].toFixed(1), r.elev[r.n-1].toFixed(1));
let mn=1e9,mx=-1e9, below=0, N=0;
for(let x=-1500;x<=1500;x+=50)for(let z=-2500;z<=300;z+=50){const h=t.heightAt(x,z);mn=Math.min(mn,h);mx=Math.max(mx,h);N++;if(h<t.seaLevel)below++;}
console.log('h range',mn.toFixed(1),mx.toFixed(1),'below sea',below,'/',N);
let s=0,c=0,maxs=0;for(let x=-600;x<=800;x+=20)for(let z=-1800;z<=100;z+=20){const sl=t.slopeAt(x,z);s+=sl;c++;maxs=Math.max(maxs,sl);}
console.log('mean slope',(s/c).toFixed(3),'max',maxs.toFixed(2));
const t0=performance.now(); let acc=0; for(let i=0;i<20000;i++){acc+=t.heightAt(i*0.37%1000-300,(i*0.91)%1500-1500);} console.log('heightAt us', ((performance.now()-t0)/20000*1000).toFixed(2));
console.log('start h', t.heightAt(6,46).toFixed(1), 'far h(4000,-900)', t.heightAt(4000,-900).toFixed(0), t.heightAt(-5000,-900).toFixed(0), t.heightAt(150,-6000).toFixed(0));
