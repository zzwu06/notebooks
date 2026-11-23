import test from 'node:test';
import assert from 'node:assert/strict';
import {poolingPoint as w} from '../src/pooling-model.js';
test('pooling coordinates preserve length and isotropic weights ignore angle',()=>{for(const a of [0,30,90,180]){const p=w(a,1.5,1.5,1,2);assert.ok(Math.abs(p.u*p.u+p.v*p.v-5)<1e-12);assert.ok(Math.abs(p.weight-w(0,1.5,1.5,1,2).weight)<1e-12);}});
test('normalized rotated fields integrate to one and widening reduces peak',()=>{for(const a of [0,37,90]){let total=0;const h=.1;for(let x=-18+h/2;x<18;x+=h)for(let y=-18+h/2;y<18;y+=h)total+=w(a,3,.5,x,y).weight*h*h;assert.ok(Math.abs(total-1)<1e-7);}assert.ok(w(90,3,.7,0,0).peak<w(90,1.5,.7,0,0).peak);});
