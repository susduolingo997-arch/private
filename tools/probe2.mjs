import { Terrain } from '../src/world/Terrain.js';
const t = new Terrain();
for (const R of [2000,3000,4000,6000,9000,14000]) {
  let mx=-1e9,mn=1e9,ang=0; 
  for(let a=0;a<360;a+=10){let m=-1e9; for(let r=R-500;r<=R+500;r+=100){const h=t.baseHeight(150+Math.cos(a*Math.PI/180)*r,-900+Math.sin(a*Math.PI/180)*r,false);m=Math.max(m,h);mn=Math.min(mn,h);} if(m>mx){mx=m;ang=a}}
  console.log(R,'max',mx.toFixed(0),'at',ang,'min',mn.toFixed(0));
}
