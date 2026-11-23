import {gratingValues} from './grating-values.js';
const el=id=>document.getElementById('geo-'+id);
const f=n=>(Math.abs(n)<0.0005?0:n).toFixed(2);
function canvas(id){const e=el(id),c=e.getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,e.width/2,e.height/2);c.strokeStyle='#111';c.fillStyle='#111';c.lineWidth=1;c.font='13px Arial';return c;}
function line(c,x,y,X,Y,dash=[]){c.setLineDash(dash);c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();c.setLineDash([]);}
function text(c,t,x,y,align='left'){c.textAlign=align;c.fillStyle='#111';c.fillText(t,x,y);}
function dot(c,x,y,open=false){c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fillStyle=open?'#fff':'#111';c.fill();c.stroke();c.fillStyle='#111';}
function arrow(c,x,y,X,Y){if(Math.hypot(X-x,Y-y)<0.5)return;line(c,x,y,X,Y);const a=Math.atan2(Y-y,X-x);line(c,X,Y,X-7*Math.cos(a-.45),Y-7*Math.sin(a-.45));line(c,X,Y,X-7*Math.cos(a+.45),Y-7*Math.sin(a+.45));}
function curve(c,fn,X,Y,dashed=false){c.setLineDash(dashed?[4,4]:[]);c.lineWidth=dashed?1:1.7;c.beginPath();for(let i=0;i<=350;i++){const z=-3+6*i/350;i?c.lineTo(X(z),Y(fn(z))):c.moveTo(X(z),Y(fn(z)));}c.stroke();c.setLineDash([]);c.lineWidth=1;}
function ruler(c,value,max,unit,other){const X=v=>35+(v+max)/(2*max)*350;line(c,35,60,385,60);[-max,0,max].forEach(v=>{line(c,X(v),56,X(v),65);text(c,String(v),X(v),84,'center');});if(other!==undefined){dot(c,X(other),60,true);line(c,X(other),43,X(value),43);}dot(c,X(value),60);text(c,unit,210,17,'center');text(c,f(value),X(value),35,'center');}
function wheel(c,a,b,project=false){const ox=145,oy=55,r=39;c.beginPath();c.arc(ox,oy,r,0,2*Math.PI);c.stroke();line(c,ox-r-10,oy,ox+r+10,oy);const px=ox+r*Math.cos(b),py=oy-r*Math.sin(b);if(a!==null)line(c,ox,oy,ox+r*Math.cos(a),oy-r*Math.sin(a),[3,3]);arrow(c,ox,oy,px,py);dot(c,px,py);if(project){line(c,px,py,px,oy,[2,3]);dot(c,px,oy);text(c,'horizontal coordinate',220,40);text(c,'cos b = '+f(Math.cos(b)),220,63);}else{text(c,f(b)+' rad',220,47);text(c,f(b/(2*Math.PI))+' turns',220,69);}}
export function renderDetails(input){
  const {angle,x,y,f:freq,C,phase,mean}=input,v=gratingValues(input),X=z=>48+(z+3)/6*350;
  for(const id of ['f','c','phase']){
    const c=canvas('demo-'+id),ff=id==='f'?freq:.5,cc=id==='c'?C:.8,pp=id==='phase'?phase:0;
    const base=z=>.8*Math.cos(Math.PI*z),selected=z=>cc*Math.cos(2*Math.PI*ff*z+pp);
    text(c,'Reference',48,15);text(c,'Selected',48,70);
    for(let i=0;i<350;i++){const z=-3+6*(i+.5)/350;for(const [fn,yy] of [[base,22],[selected,77]]){const gray=Math.round(127.5*(1+fn(z)));c.fillStyle=`rgb(${gray},${gray},${gray})`;c.fillRect(48+i,yy,1,29);}}
    c.fillStyle='#111';const Y=s=>171-s*34;
    text(c,'s',31,125);line(c,48,123,48,212);line(c,48,212,398,212);
    [-1,0,1].forEach(s=>{line(c,44,Y(s),48,Y(s));text(c,String(s),37,Y(s)+4,'right');});
    [-3,0,3].forEach(z=>{line(c,X(z),212,X(z),217);text(c,String(z),X(z),233,'center');});
    curve(c,base,X,Y,true);curve(c,selected,X,Y);text(c,'Distance across bars ℓ (°)',223,254,'center');
    if(id==='f'){const left=-1/(2*ff),right=1/(2*ff);line(c,X(left),116,X(right),116);line(c,X(left),111,X(left),120);line(c,X(right),111,X(right),120);text(c,'1/f = '+f(1/ff)+'°',223,131,'center');}
    if(id==='c'){line(c,285,Y(0),285,Y(cc));line(c,280,Y(cc),290,Y(cc));text(c,'C = '+f(cc),295,145);}
    if(id==='phase'){const shift=-pp/(2*Math.PI*ff);arrow(c,X(0),116,X(shift),116);text(c,'shift '+f(shift)+'°',223,132,'center');}
    const caption=id==='f'?`${f(ff)} cycles/degree → spacing ${f(1/ff)}°. The 6° window contains ${f(6*ff)} cycles.`:id==='c'?`The wave ranges from −${f(cc)} to +${f(cc)}; its mean is zero. The reference amplitude is 0.80.`:`Phase ${f(pp)} rad = ${f(pp/(2*Math.PI))} cycles. At f = 0.50, a bright peak shifts from 0° to ${f(-pp/Math.PI)}°. Dashed: phase zero.`;
    el('demo-'+id+'-readout').textContent=caption;el('demo-'+id).setAttribute('aria-label',caption);
  }
  const numeric=[`(${f(-Math.sin(angle*Math.PI/180))}) × ${f(x)} + (${f(Math.cos(angle*Math.PI/180))}) × ${f(y)} = ${f(v.distance)}°`,`${f(freq)} cycles/degree × ${f(v.distance)}° = ${f(v.cycles)} cycles`,`2π × ${f(v.cycles)} = ${f(v.radians)} rad`,`${f(v.radians)} + (${f(phase)}) = ${f(v.shifted)} rad`,`cos(${f(v.shifted)}) = ${f(v.cosine)}`,`${f(C)} × (${f(v.cosine)}) = ${f(v.contrast)} relative contrast`];
  for(let i=1;i<=6;i++){const c=canvas('step-'+i);if(i===1)ruler(c,v.distance,3,'Distance ℓ (degrees)');if(i===2)ruler(c,v.cycles,3,'Number of cycles u');if(i===3)wheel(c,null,v.radians);if(i===4)wheel(c,v.radians,v.shifted);if(i===5)wheel(c,null,v.shifted,true);if(i===6)ruler(c,v.contrast,1,'Signed contrast s',v.cosine);el('step-'+i+'-value').textContent=numeric[i-1];el('step-'+i).setAttribute('aria-label',numeric[i-1]);}
  const c=canvas('luminance'),Y=L=>174-L/200*145;
  line(c,48,24,48,174);line(c,48,174,398,174);
  [0,100,200].forEach(L=>{line(c,44,Y(L),48,Y(L));text(c,String(L),38,Y(L)+4,'right');});
  [-3,0,3].forEach(z=>{line(c,X(z),174,X(z),179);text(c,String(z),X(z),195,'center');});
  text(c,'Luminance (cd/m²)',48,15);text(c,'Distance across bars ℓ (°)',223,216,'center');
  curve(c,z=>mean*(1+C*Math.cos(2*Math.PI*freq*z+phase)),X,Y);
  const sx=X(v.distance);arrow(c,sx,Y(mean),sx,Y(v.luminance));dot(c,sx,Y(mean),true);dot(c,sx,Y(v.luminance));
  el('mean-out').value=String(mean);
  const caption=`L = ${mean} + (${mean} × ${f(v.contrast)}) = ${f(v.luminance)} cd/m². Mean: ${mean}; minimum: ${f(v.minimum)}; maximum: ${f(v.maximum)} cd/m². Changing the mean preserves the relative contrast ${f(v.contrast)}.`;
  el('luminance-readout').textContent=caption;el('luminance').setAttribute('aria-label',caption);
}
