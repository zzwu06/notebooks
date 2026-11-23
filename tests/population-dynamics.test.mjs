import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivity,connectionMatrix,advanceActivity} from '../src/population-dynamics.js';
test('dynamic demo preserves uncoupled activity and omits self connections',()=>{
 const r=initialActivity(),w=connectionMatrix(0);
 assert.deepEqual(advanceActivity(r,w),r);
 connectionMatrix(1).forEach((row,i)=>assert.equal(row[i],0));
});
test('dynamic demo stays within plot bounds and converges under smaller time steps',()=>{
 for(const gain of [0,.4,.8,1]){
  const w=connectionMatrix(gain);let a=initialActivity(),b=initialActivity();
  for(let i=0;i<600;i++){
   a=advanceActivity(a,w,.5);b=advanceActivity(advanceActivity(b,w,.25),w,.25);
   assert.ok(a.every(v=>Number.isFinite(v)&&v>=0&&v<1.2));
   assert.ok(Math.max(...a.map((v,j)=>Math.abs(v-b[j])))<.002);
  }
 }
});
import {thresholdInput} from '../src/threshold-demo.js';
import {preferences} from '../src/population-dynamics.js';

test('steady-state derivation matches active-set equations and time dynamics',()=>{
 const input=preferences.map(a=>thresholdInput(a)-.3);
 for(const gain of [0,.8,1]){
  const w=connectionMatrix(gain);
  assert.ok(w.every(row=>row.reduce((s,v)=>s+Math.abs(v),0)<=.9*gain+1e-12));
  const target=r=>w.map((row,i)=>Math.max(0,input[i]+row.reduce((s,v,j)=>s+v*r[j],0)));
  let r=initialActivity();for(let n=0;n<250;n++)r=target(r);
  assert.ok(Math.max(...target(r).map((v,i)=>Math.abs(v-r[i])))<1e-12);
  const active=r.flatMap((v,i)=>v>1e-10?[i]:[]);
  const m=active.map(i=>[...active.map(j=>(i===j?1:0)-w[i][j]),input[i]]);
  // Independent Gaussian elimination of the active-set linear equations.
  for(let k=0;k<m.length;k++){
   const pivot=m[k][k];assert.ok(Math.abs(pivot)>1e-10);
   for(let j=k;j<=m.length;j++)m[k][j]/=pivot;
   for(let i=0;i<m.length;i++)if(i!==k){const factor=m[i][k];for(let j=k;j<=m.length;j++)m[i][j]-=factor*m[k][j];}
  }
  active.forEach((i,k)=>assert.ok(Math.abs(m[k].at(-1)-r[i])<1e-10));
  r.forEach((v,i)=>{if(v===0)assert.ok(input[i]+w[i].reduce((s,x,j)=>s+x*r[j],0)<=1e-12)});
  let trajectory=initialActivity();for(let n=0;n<2000;n++)trajectory=advanceActivity(trajectory,w,.5);
  assert.ok(Math.max(...trajectory.map((v,i)=>Math.abs(v-r[i])))<1e-8);
 }
});
