export const connectionKernel=(difference,gain)=>gain*(.3+1.2*Math.cos(2*difference*Math.PI/180));
const el=id=>document.getElementById(id);
const x=d=>60+(d+90)/180*480, y=w=>270-(w+1)/2.6*230;
const text=(a,b,label,attrs='')=>`<text x="${a}" y="${b}" ${attrs}>${label}</text>`;
function render(){
  const gain=Number(el('population-gain').value),difference=Number(el('connection-difference').value),weight=connectionKernel(difference,gain);
  el('population-gain-value').value=gain.toFixed(2);el('connection-difference-value').value=`${difference}°`;
  const ticks=[-90,-45,0,45,90].map(d=>`<path d="M${x(d)} 270v5"/>${text(x(d),293,`${d}°`,'text-anchor="middle"')}`).join('');
  const levels=[-.8,0,.8,1.6].map(w=>`<path d="M55 ${y(w)}h5"/>${text(48,y(w)+4,w.toFixed(1),'text-anchor="end"')}`).join('');
  const curve=Array.from({length:361},(_,i)=>{const d=-90+i/2;return `${i?'L':'M'}${x(d).toFixed(2)} ${y(connectionKernel(d,gain)).toFixed(2)}`;}).join(' ');
  const anchor=difference>75?'end':difference< -75?'start':'middle';
  el('connection-curve').innerHTML=`<title>Cosine connection profile</title><g fill="none" stroke="#111" stroke-width="1"><path d="M60 32V270H540"/>${ticks}${levels}<path d="${curve}" stroke-width="2"/></g>${text(60,18,'Connection kernel J')}${text(300,322,'Difference between preferred orientations','text-anchor="middle"')}<circle cx="${x(difference)}" cy="${y(weight)}" r="5" fill="#111" stroke="white" stroke-width="2"/>${text(x(difference),y(weight)-12,weight.toFixed(2),`text-anchor="${anchor}"`)}`;
  el('connection-curve').setAttribute('aria-label',`Connection profile at gain ${gain}. At a preference difference of ${difference} degrees, J is ${weight.toFixed(2)}.`);
}
if(typeof document!=='undefined' && el('connection-curve')){
  ['population-gain','connection-difference'].forEach(id=>el(id).addEventListener('input',render));
  el('population-reset').addEventListener('click',()=>{el('population-gain').value=.8;el('connection-difference').value=0;render();});render();
}
