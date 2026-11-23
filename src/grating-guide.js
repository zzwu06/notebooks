import { renderDetails } from './grating-details.js';
const ids = ['angle','x','y','f','c','phase'];
const initial = [30,1,1,0.5,0.8,0];
const el = id => document.getElementById('geo-'+id);
const fmt = n => (Math.abs(n)<0.0005?0:n).toFixed(2);
function context(id) {
  const canvas=el(id), c=canvas.getContext('2d');
  c.setTransform(2,0,0,2,0,0); c.clearRect(0,0,420,420);
  c.font='13px Arial'; c.lineWidth=1; c.fillStyle='#111'; c.strokeStyle='#111';
  return c;
}
function segment(c,a,b,dash=[]) {
  c.setLineDash(dash); c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); c.setLineDash([]);
}
function label(c,s,x,y,align='left') {
  c.textAlign=align; c.lineWidth=4; c.strokeStyle='#fff'; c.strokeText(s,x,y);
  c.fillStyle='#111'; c.fillText(s,x,y); c.strokeStyle='#111'; c.lineWidth=1;
}
function arrow(c,a,b,dash=[]) {
  c.lineWidth=2; segment(c,a,b,dash);
  const t=Math.atan2(b[1]-a[1],b[0]-a[0]);
  c.beginPath(); c.moveTo(...b); c.lineTo(b[0]-9*Math.cos(t-0.4),b[1]-9*Math.sin(t-0.4));
  c.lineTo(b[0]-9*Math.cos(t+0.4),b[1]-9*Math.sin(t+0.4));c.closePath();c.fill();c.lineWidth=1;
}
function render() {
  const [angle,x,y,f,C,phase]=ids.map(id=>Number(el(id).value));
  const t=angle*Math.PI/180, nx=-Math.sin(t),ny=Math.cos(t),q=nx*x+ny*y;
  for (const id of ['x','f','phase','c']) { el('follow-'+id).value=el(id).value; el('follow-'+id+'-out').value=fmt(Number(el(id).value)); }
  renderDetails({angle,x,y,f,C,phase,mean:Number(el('mean').value)});
  const stimulus=z=>C*Math.cos(2*Math.PI*f*z+phase);
  ids.forEach((id,i)=>el(id+'-out').value=id==='angle'?angle+'°':fmt([angle,x,y,f,C,phase][i]));
  const c=context('plane'), o=210, scale=58, pt=(x,y)=>[o+scale*x,o-scale*y];
  // The raster and annotations share the same upward-positive spatial coordinates.
  const raster=document.createElement('canvas');raster.width=raster.height=320;
  const rc=raster.getContext('2d'),pixels=rc.createImageData(320,320);
  for(let row=0;row<320;row++)for(let col=0;col<320;col++){
    const px=(col+0.5-160)/scale,py=(160-row-0.5)/scale;
    const gray=127.5*(1+stimulus(nx*px+ny*py)),k=4*(row*320+col);
    pixels.data[k]=pixels.data[k+1]=pixels.data[k+2]=gray;pixels.data[k+3]=255;
  }
  rc.putImageData(pixels,0,0);c.drawImage(raster,50,50);
  segment(c,[40,380],[380,380]);segment(c,[40,380],[40,40]);
  [-2,0,2].forEach(v=>{const [px,py]=pt(v,v);segment(c,[px,380],[px,385]);label(c,String(v),px,400,'center');segment(c,[35,py],[40,py]);label(c,String(v),27,py+4,'right');});
  label(c,'x (°)',405,400,'right');label(c,'y (°)',14,25);
  // White underlay keeps the geometric arrows readable over dark bands.
  const along=pt(2.1*Math.cos(t),2.1*Math.sin(t)),normal=pt(2.1*nx,2.1*ny);
  c.strokeStyle='#fff';c.lineWidth=5;segment(c,[o,o],along);segment(c,[o,o],normal);c.strokeStyle='#111';
  arrow(c,[o,o],along);arrow(c,[o,o],normal,[6,4]);
  label(c,'along',along[0],along[1]-12,'center');label(c,'nθ',normal[0],normal[1]-12,'center');
  c.beginPath();c.arc(o,o,34,-t,0);c.stroke();label(c,'θ',o+45*Math.cos(t/2),o-45*Math.sin(t/2),'center');
  segment(c,[o,o],[o+48,o],[2,3]);
  const p=pt(x,y),projection=pt(q*nx,q*ny);
  c.strokeStyle='#fff';c.lineWidth=3;segment(c,p,projection);c.strokeStyle='#111';c.lineWidth=1;segment(c,p,projection,[2,3]);
  c.fillStyle='#111';c.fillRect(projection[0]-3,projection[1]-3,6,6);
  c.beginPath();c.arc(...p,6,0,2*Math.PI);c.fillStyle='#fff';c.fill();c.stroke();label(c,'(x, y)',p[0]+10,p[1]+18);
  el('plane').setAttribute('aria-label',`Bars at ${angle} degrees. Sample at (${fmt(x)}, ${fmt(y)}) degrees; perpendicular distance ${fmt(q)} degrees.`);
  const d=context('profile'),X=z=>48+(z+3)/6*350,Y=z=>86-z*58;
  segment(d,[48,20],[48,148]);segment(d,[48,148],[398,148]);
  [-1,0,1].forEach(v=>{segment(d,[44,Y(v)],[48,Y(v)]);label(d,String(v),38,Y(v)+4,'right');});
  [-3,0,3].forEach(v=>{segment(d,[X(v),148],[X(v),153]);label(d,String(v),X(v),169,'center');});
  label(d,'Signed contrast s',48,14);label(d,'Distance across bars ℓ (°)',223,193,'center');
  d.beginPath();for(let i=0;i<=350;i++){const z=-3+6*i/350;i?d.lineTo(X(z),Y(stimulus(z))):d.moveTo(X(z),Y(stimulus(z)));}d.lineWidth=1.8;d.stroke();
  d.beginPath();d.arc(X(q),Y(stimulus(q)),4,0,2*Math.PI);d.fillStyle='#111';d.fill();
  el('distance').textContent=`nθ = (${fmt(nx)}, ${fmt(ny)}). At (x, y) = (${fmt(x)}, ${fmt(y)})°, ℓ = (${fmt(nx)}) × (${fmt(x)}) + (${fmt(ny)}) × (${fmt(y)}) = ${fmt(q)}°.`;
  el('stimulus').textContent=`At the marked point: s = ${fmt(C)} × cos(2π × ${fmt(f)} × ${fmt(q)} + ${fmt(phase)}) = ${fmt(stimulus(q))}. One cycle spans ${fmt(1/f)}° across the bars. Values are rounded for display.`;
  el('profile').setAttribute('aria-label',`Contrast profile with sample at ℓ ${fmt(q)} degrees and signed contrast ${fmt(stimulus(q))}.`);
}
ids.forEach(id=>el(id).addEventListener('input',render));
for (const id of ['x','f','phase','c']) el('follow-'+id).addEventListener('input',()=>{el(id).value=el('follow-'+id).value;render();});
el('mean').addEventListener('input',render);
el('reset').addEventListener('click',()=>{ids.forEach((id,i)=>el(id).value=initial[i]);el('mean').value=50;render();});
render();
