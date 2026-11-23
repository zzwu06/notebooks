import test from 'node:test';
import assert from 'node:assert/strict';
import {setupNavigation} from '../src/navigation.js';
test('navigation returns from references to a long expanded mathematics section',()=>{
 let tops=[-9000,100],frame;
 const events={};
 const links=['math','references'].map(id=>({hash:'#'+id,attributes:{},classList:{toggle(_,value){this.active=value}},setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]}}));
 const doc={querySelectorAll:()=>links,getElementById:id=>({getBoundingClientRect:()=>({top:tops[id==='math'?0:1]})}),addEventListener(k,f){events[k]=f}};
 const win={innerHeight:1000,addEventListener(k,f){events[k]=f},requestAnimationFrame(f){frame=f}};
 setupNavigation(doc,win);
 assert.equal(links[1].attributes['aria-current'],'location');
 // Scrolling upward puts the reading line inside the long mathematics section.
 tops=[-8000,700];events.scroll();frame();
 assert.equal(links[0].attributes['aria-current'],'location');
 assert.equal(links[1].attributes['aria-current'],undefined);
 assert.equal(links[1].classList.active,false);
 // Collapsing the derivation moves References back above the reading line.
 tops=[-200,100];events.toggle();frame();
 assert.equal(links[1].classList.active,true);
 // Resizing changes the reading line and recalculates the selection.
 win.innerHeight=200;events.resize();frame();
 assert.equal(links[0].classList.active,true);
 assert.equal(links.filter(l=>l.classList.active).length,1);
});
