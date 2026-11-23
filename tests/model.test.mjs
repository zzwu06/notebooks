import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { angles, rad, gaussianResponse, feedforward, thresholdCurve, 
  weights, derivative, steady, trace, normalize } from '../src/model.js';

test('Gaussian spatial integral agrees with analytic Fourier response', () => {
  const parallel=1.8, perpendicular=.7, dx=.06, limit=11;
  for (const angle of [0,30,60,90]) {
    let sum=0;
    for(let x=-limit; x<=limit; x+=dx) for(let y=-limit; y<=limit; y+=dx) {
      const w=Math.exp(-.5*(y*y/parallel**2+x*x/perpendicular**2))/(2*Math.PI*parallel*perpendicular);
      sum+=w*Math.cos(-Math.sin(rad(angle))*x+Math.cos(rad(angle))*y)*dx*dx;
    }
    assert.ok(Math.abs(sum-gaussianResponse(angle,parallel,perpendicular))<1e-7);
  }
});
test('normalized geometry is periodic and isotropic pooling is flat', () => {
  for(const angle of angles) {
    assert.ok(Math.abs(feedforward(angle)-feedforward(angle+180))<1e-12);
    assert.equal(feedforward(angle,0),1);
    const raw=gaussianResponse(angle,Math.sqrt(.49+6),.7);
    const peak=gaussianResponse(90,Math.sqrt(.49+6),.7);
    assert.ok(Math.abs(.15+.85*raw/peak-feedforward(angle))<1e-12);
  }
});
test('threshold suppresses weak inputs and handles a silent output', () => {
  for (const t of [0, .3, .6, 1]) {
    const output = thresholdCurve(3,t);
    angles.forEach((a,i) => assert.equal(output[i], Math.max(0,feedforward(a)-t)));
  }
  assert.ok(normalize(thresholdCurve(3,1)).every(x => x === 0));
});
test('all selectable gains are contractive and equilibria satisfy the ODE', () => {
  for(let g=0;g<=1.10001;g+=.05) {
    const w=weights(g),r=steady(g);
    assert.ok(w.every(row=>row.reduce((s,v)=>s+Math.abs(v),0)<1));
    assert.ok(r.every(v=>v>=0&&Number.isFinite(v)));
    assert.ok(Math.max(...derivative(r,w).map(Math.abs))<1e-8);
  }
});
test('discrete kernel has the stated uniform and tuned eigenmodes', () => {
  const g=.8,w=weights(g);
  for(const [mode,eigenvalue] of [[angles.map(()=>1),.3*g], [angles.map(a=>Math.cos(2*rad(a))),.6*g], [angles.map(a=>Math.sin(2*rad(a))),.6*g]]) {
    w.forEach((row,i)=>assert.ok(Math.abs(row.reduce((s,v,j)=>s+v*mode[j],0)-eigenvalue*mode[i])<1e-12));
  }
});
test('zero coupling gives rectified input', () => {
  const r=steady(0);
  angles.forEach((a,i)=>assert.ok(Math.abs(r[i]-Math.max(0,feedforward(a)-.2))<1e-10));
});
test('halving Euler step preserves the default trajectory', () => {
  const a=trace(.8,'switch',1),b=trace(.8,'switch',.5);
  assert.ok(Math.max(...a.map(([t,v],i)=>Math.abs(v-b[2*i][1])))<.015);
});
test('intervention is continuous and approaches uncoupled equilibrium', () => {
  const a=trace(.8,'off'),b=trace(.8,'switch');
  assert.equal(a[200][1],b[200][1]);
  assert.ok(Math.abs(a.at(-1)[1]-steady(0)[18])<1e-5);
});
test('English notebook has unique IDs and valid anchors', () => {
  const html=readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(m[1]));
  assert.equal((html.match(/<svg /g)||[]).length,4);
  assert.equal((html.match(/<canvas /g)||[]).length,4);
  for(const file of ['index.html','app.js','style.css','model.js']) {
    assert.ok(!/[\u4e00-\u9fff]/.test(readFileSync(new URL('../src/'+file,import.meta.url),'utf8')));
  }
});
