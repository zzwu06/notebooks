import test from 'node:test';
import assert from 'node:assert/strict';
import {gratingValues as values} from '../src/grating-values.js';
const p={angle:37,x:.7,y:-.4,f:.6,C:.8,phase:.3,mean:50};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('moving along a bar preserves contrast; moving one spacing across it completes a cycle',()=>{
 const t=p.angle*Math.PI/180,v=values(p);
 near(values({...p,x:p.x+2*Math.cos(t),y:p.y+2*Math.sin(t)}).contrast,v.contrast);
 near(values({...p,x:p.x-Math.sin(t)/p.f,y:p.y+Math.cos(t)/p.f}).contrast,v.contrast);
});
test('phase addition is equivalent to sampling a translated spatial pattern',()=>{
 const t=p.angle*Math.PI/180,shift=p.phase/(2*Math.PI*p.f);
 near(values(p).contrast,values({...p,phase:0,x:p.x-shift*Math.sin(t),y:p.y+shift*Math.cos(t)}).contrast);
 near(values({...p,phase:p.phase+2*Math.PI}).contrast,values(p).contrast);
});
test('physical luminance respects contrast bounds and scaling of the mean',()=>{
 for(const C of [0,.2,1])for(let phase=-Math.PI;phase<=Math.PI;phase+=.13){const v=values({...p,C,phase});assert.ok(v.luminance>=v.minimum-1e-10&&v.luminance<=v.maximum+1e-10);assert.ok(v.minimum>=0);}
 near(values({...p,C:0}).luminance,p.mean);
 near(values({...p,mean:100}).luminance,2*values(p).luminance);
 near(values({...p,angle:0,x:0,y:0,phase:Math.PI,C:1}).luminance,0);
});
