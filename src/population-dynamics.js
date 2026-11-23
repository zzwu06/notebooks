import { thresholdOutput, thresholdInput } from './threshold-demo.js';
import { connectionKernel } from './population-demo.js';
export const preferences = Array.from({length:72},(_,i)=>i*2.5);
export const initialActivity = () => preferences.map(a=>thresholdOutput(a,.3));
export const connectionMatrix = gain => preferences.map((a,i)=>preferences.map((b,j)=>i===j?0:connectionKernel(a-b,gain)/preferences.length));
export function advanceActivity(rates,matrix,dt=.5) {
  return rates.map((r,i)=>{
    const recurrent=matrix[i].reduce((sum,w,j)=>sum+w*rates[j],0);
    const target=Math.max(0,thresholdInput(preferences[i])+recurrent-.3);
    return r+dt/20*(target-r);
  });
}
const el=id=>document.getElementById(id);
if(typeof document!=='undefined' && el('dynamics-curve')) {
  let rates=initialActivity(),matrix=connectionMatrix(.8),time=0,playing=false,last=null,frame;
  const baseline=initialActivity(),x=a=>56+a/180*480,y=r=>270-r/1.2*230;
  const text=(a,b,t,attrs='')=>`<text x="${a}" y="${b}" ${attrs}>${t}</text>`;
  const path=values=>[...values,values[0]].map((v,i)=>`${i?'L':'M'}${x(i*2.5).toFixed(2)} ${y(v).toFixed(2)}`).join(' ');
  function render(){
    const ticks=[0,45,90,135,180].map(a=>`<path d="M${x(a)} 270v5"/>${text(x(a),292,`${a}°`,'text-anchor="middle"')}`).join('');
    const levels=[0,.4,.8,1.2].map(r=>`<path d="M51 ${y(r)}h5"/>${text(45,y(r)+4,r.toFixed(1),'text-anchor="end"')}`).join('');
    el('dynamics-curve').innerHTML=`<title>Population activity after connections turn on</title><g fill="none" stroke="#111" stroke-width="1"><path d="M56 32V270H536"/>${ticks}${levels}<path d="${path(baseline)}" stroke-width="1.5" stroke-dasharray="6 4"/><path d="${path(rates)}" stroke-width="2"/></g>${text(56,18,'Activity (a.u.)')}${text(296,322,'Preferred orientation','text-anchor="middle"')}`;
    el('dynamics-time').value=`${Math.round(time)} ms`;
    el('dynamics-play').textContent=playing?'Pause':time>=300?'Replay':'Play';
  }
  function pause(){playing=false;cancelAnimationFrame(frame);last=null;render();}
  function restart(){pause();time=0;rates=initialActivity();render();}
  function tick(now){
    if(!playing)return;
    if(last!==null){
      const elapsed=Math.min(now-last,100)*.03;
      const end=Math.min(time+elapsed,300);
      while(time<end){const dt=Math.min(.5,end-time);rates=advanceActivity(rates,matrix,dt);time+=dt;}
    }
    last=now;
    if(time>=300){pause();return;}
    render();frame=requestAnimationFrame(tick);
  }
  el('dynamics-play').addEventListener('click',()=>{if(playing){pause();return;}if(time>=300)restart();playing=true;last=null;render();frame=requestAnimationFrame(tick);});
  el('dynamics-restart').addEventListener('click',restart);
  el('dynamics-gain').addEventListener('input',()=>{const gain=Number(el('dynamics-gain').value);el('dynamics-gain-value').value=gain.toFixed(2);matrix=connectionMatrix(gain);restart();});
  el('dynamics-reset').addEventListener('click',()=>{el('dynamics-gain').value=.8;el('dynamics-gain-value').value='0.80';matrix=connectionMatrix(.8);restart();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  render();
}
