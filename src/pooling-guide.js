import {poolingPoint} from './pooling-model.js';
const ids=['angle','long','short','x','y'],defaults=[90,2.5,.7,1,1];
const el=id=>document.getElementById('pool-'+id),fmt=(v,n=2)=>(Math.abs(v)<1e-9?0:v).toFixed(n);
function ctx(id){const c=el(id).getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,420,420);c.font='13px Arial';c.fillStyle=c.strokeStyle='#111';c.lineWidth=1;return c;}
function line(c,a,b,d=[]){c.setLineDash(d);c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();c.setLineDash([]);}
function text(c,t,x,y,align='left'){c.textAlign=align;c.strokeStyle='#fff';c.lineWidth=3;c.strokeText(t,x,y);c.fillStyle='#111';c.fillText(t,x,y);c.strokeStyle='#111';c.lineWidth=1;}
function arrow(c,a,b,d=[]){c.strokeStyle='#fff';c.lineWidth=4;line(c,a,b);c.strokeStyle='#111';c.lineWidth=1.5;line(c,a,b,d);const t=Math.atan2(b[1]-a[1],b[0]-a[0]);line(c,b,[b[0]-8*Math.cos(t-.4),b[1]-8*Math.sin(t-.4)]);line(c,b,[b[0]-8*Math.cos(t+.4),b[1]-8*Math.sin(t+.4)]);c.lineWidth=1;}
function render(){
 const [angle,long,short,x,y]=ids.map(id=>Number(el(id).value)),a=angle*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
 const v=poolingPoint(angle,long,short,x,y),P=(x,y)=>[210+27*x,210-27*y];
 ids.forEach((id,i)=>el(id+'-out').value=fmt([angle,long,short,x,y][i])+(id==='angle'?'°':''));
 const c=ctx('plane'),r=document.createElement('canvas');r.width=r.height=324;const rc=r.getContext('2d'),im=rc.createImageData(324,324),max=1/(2*Math.PI*1.5*.5);
 for(let row=0;row<324;row++)for(let col=0;col<324;col++){const px=(col+.5-162)/27,py=(162-row-.5)/27,w=poolingPoint(angle,long,short,px,py).weight,k=4*(row*324+col);im.data[k]=im.data[k+1]=im.data[k+2]=255*(1-w/max);im.data[k+3]=255;}rc.putImageData(im,0,0);c.drawImage(r,48,48);
 line(c,[40,380],[380,380]);line(c,[40,380],[40,40]);[-6,0,6].forEach(t=>{const [px,py]=P(t,t);line(c,[px,380],[px,385]);text(c,t,px,401,'center');line(c,[35,py],[40,py]);text(c,t,28,py+4,'right');});text(c,'x (°)',409,401,'right');text(c,'y (°)',16,26);
 const up=P(4.7*co,4.7*si),vp=P(-4.7*si,4.7*co);arrow(c,P(0,0),up);arrow(c,P(0,0),vp,[5,4]);text(c,'u',up[0],up[1]-10,'center');text(c,'v',vp[0],vp[1]-10,'center');
 c.beginPath();for(let i=0;i<=120;i++){const t=2*Math.PI*i/120,U=long*Math.cos(t),V=short*Math.sin(t),p=P(U*co-V*si,U*si+V*co);i?c.lineTo(...p):c.moveTo(...p);}c.stroke();
 const p=P(x,y);line(c,p,P(v.u*co,v.u*si),[2,3]);line(c,p,P(-v.v*si,v.v*co),[2,3]);c.beginPath();c.arc(...p,5,0,2*Math.PI);c.fillStyle='#fff';c.fill();c.stroke();text(c,'(x, y)',p[0]+8,p[1]+17);
 const d=ctx('sections'),X=z=>54+(z+6)/12*344,Y=w=>185-w/.22*150;
 line(d,[54,25],[54,185]);line(d,[54,185],[398,185]);[0,.1,.2].forEach(w=>{line(d,[49,Y(w)],[54,Y(w)]);text(d,fmt(w,1),43,Y(w)+4,'right');});[-6,0,6].forEach(z=>{line(d,[X(z),185],[X(z),190]);text(d,z,X(z),208,'center');});text(d,'Weight (degree⁻²)',54,16);text(d,'Distance along each axis (°)',225,233,'center');
 [long,short].forEach((sigma,j)=>{d.setLineDash(j?[5,4]:[]);d.lineWidth=1.8;d.beginPath();for(let i=0;i<=344;i++){const z=-6+12*i/344,w=v.peak*Math.exp(-.5*(z/sigma)**2);i?d.lineTo(X(z),Y(w)):d.moveTo(X(z),Y(w));}d.stroke();});d.setLineDash([]);
 el('coordinates').textContent=`u = (${fmt(x)}) × (${fmt(co)}) + (${fmt(y)}) × (${fmt(si)}) ≈ ${fmt(v.u)}°. v = −(${fmt(x)}) × (${fmt(si)}) + (${fmt(y)}) × (${fmt(co)}) ≈ ${fmt(v.v)}°.`;
 el('weight').textContent=`u/σ∥ = ${fmt(v.u/long)}; v/σ⊥ = ${fmt(v.v/short)}. Exponent ≈ ${fmt(v.exponent)}; relative weight exp(exponent) ≈ ${fmt(Math.exp(v.exponent),3)}. Multiply by peak ${fmt(v.peak,4)} to get w ≈ ${fmt(v.weight,4)} degree⁻².`;
 el('normalization').textContent=`σ∥ = ${fmt(long)}°, σ⊥ = ${fmt(short)}°; peak = 1 / (2π × ${fmt(long)} × ${fmt(short)}) ≈ ${fmt(v.peak,4)} degree⁻². Total weight over the entire plane = 1.`;
 el('plane').setAttribute('aria-label',`Gaussian field at ${angle} degrees, widths ${long} and ${short} degrees. Sample has u ${fmt(v.u)}, v ${fmt(v.v)}, weight ${fmt(v.weight,4)}.`);
 el('sections').setAttribute('aria-label',`Along and across central slices with widths ${long} and ${short} degrees and common peak ${fmt(v.peak,4)} inverse squared degrees.`);
}
ids.forEach(id=>el(id).addEventListener('input',render));el('reset').addEventListener('click',()=>{ids.forEach((id,i)=>el(id).value=defaults[i]);render();});render();
