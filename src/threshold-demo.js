import { inputResponse } from './input-explorer.js';
export const thresholdInput = orientation => inputResponse({orientation,frequency:.25,contrast:1,phase:0});
export const thresholdOutput = (orientation,threshold) => Math.max(0,thresholdInput(orientation)-threshold);
const el=id=>document.getElementById(id);
const x=a=>52+a/180*328, y=r=>248-r*210;
const text=(a,b,label,attrs='')=>`<text x="${a}" y="${b}" ${attrs}>${label}</text>`;
function render() {
  const angle=Number(el('response-angle').value), threshold=Number(el('response-threshold').value);
  el('response-angle-value').value=`${angle}°`;
  el('response-threshold-value').value=threshold.toFixed(2);
  const input=thresholdInput(angle), output=thresholdOutput(angle,threshold);
  el('response-input').value=input.toFixed(2);el('response-output').value=output.toFixed(2);
  const canvas=el('response-stimulus'),ctx=canvas.getContext('2d'),n=canvas.width,image=ctx.createImageData(n,n),a=angle*Math.PI/180;
  for(let row=0;row<n;row++)for(let col=0;col<n;col++){
    const px=(col/(n-1)-.5)*8,py=(.5-row/(n-1))*8;
    const gray=127.5*(1+Math.cos(2*Math.PI*.25*(-Math.sin(a)*px+Math.cos(a)*py))),i=4*(row*n+col);
    image.data[i]=image.data[i+1]=image.data[i+2]=gray;image.data[i+3]=255;
  }
  ctx.putImageData(image,0,0);canvas.setAttribute('aria-label',`Static grating at ${angle} degrees`);
  const path=fn=>Array.from({length:181},(_,a)=>`${a?'L':'M'}${x(a).toFixed(2)} ${y(fn(a)).toFixed(2)}`).join(' ');
  const ticks=[0,45,90,135,180].map(a=>`<path d="M${x(a)} 248v5"/>${text(x(a),271,`${a}°`,'text-anchor="middle"')}`).join('');
  const levels=[0,.5,1].map(r=>`<path d="M47 ${y(r)}h5"/>${text(41,y(r)+4,r.toFixed(1),'text-anchor="end"')}`).join('');
  el('response-curve').innerHTML=`<title>Input and thresholded output across orientations</title><g fill="none" stroke="#111" stroke-width="1"><path d="M52 28V248H380"/>${ticks}${levels}<path d="M52 ${y(threshold)}H380" stroke-dasharray="2 5"/><path d="${path(thresholdInput)}" stroke-width="1.8" stroke-dasharray="6 4"/><path d="${path(a=>thresholdOutput(a,threshold))}" stroke-width="2"/></g>${text(52,16,'Input / output (a.u.)')}${text(216,296,'Bar orientation','text-anchor="middle"')}${text(377,y(threshold)-7,'Threshold','text-anchor="end"')}<circle cx="${x(angle)}" cy="${y(input)}" r="5" fill="white" stroke="#111" stroke-width="1.5"/><circle cx="${x(angle)}" cy="${y(output)}" r="4" fill="#111"/>`;
  el('response-curve').setAttribute('aria-label',`At ${angle} degrees, input ${input.toFixed(2)}, threshold ${threshold.toFixed(2)}, output ${output.toFixed(2)}`);
}
if(typeof document!=='undefined' && el('response-stimulus')) {
  ['response-angle','response-threshold'].forEach(id=>el(id).addEventListener('input',render));
  el('response-reset').addEventListener('click',()=>{el('response-angle').value=45;el('response-threshold').value=.3;render();});
  render();
}
