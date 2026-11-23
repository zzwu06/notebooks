const byId = id => document.getElementById(id);
const defaults = {orientation:90, frequency:.25, contrast:1, phase:0};
const settings = {...defaults};
export function inputResponse({orientation,frequency,contrast,phase}) {
  const delta=(orientation-90)*Math.PI/180, k=2*Math.PI*frequency;
  return contrast*Math.cos(phase*Math.PI/180)*Math.exp(-.5*k*k*(1.4**2*Math.sin(delta)**2+.32**2*Math.cos(delta)**2));
}
function paint(id,weighted) {
  const canvas=byId(id), ctx=canvas.getContext('2d'), n=canvas.width;
  const image=ctx.createImageData(n,n), angle=settings.orientation*Math.PI/180;
  for(let row=0;row<n;row++) for(let col=0;col<n;col++) {
    const x=(col/(n-1)-.5)*8, y=(.5-row/(n-1))*8;
    const stimulus=settings.contrast*Math.cos(2*Math.PI*settings.frequency*(-Math.sin(angle)*x+Math.cos(angle)*y)+settings.phase*Math.PI/180);
    const weight=Math.exp(-.5*((x/.32)**2+(y/1.4)**2));
    const gray=weighted ? 127.5*(1+stimulus*weight) : 127.5*(1+stimulus);
    const offset=4*(row*n+col);
    image.data[offset]=image.data[offset+1]=image.data[offset+2]=gray; image.data[offset+3]=255;
  }
  ctx.putImageData(image,0,0);
  if(!weighted) {
    ctx.beginPath();ctx.ellipse(n/2,n/2,.64/8*(n-1),2.8/8*(n-1),0,0,2*Math.PI);
    ctx.strokeStyle='white';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.stroke();
  }
  canvas.setAttribute('aria-label',`${weighted?'Weighted contrast contributions':'Grating with a fixed vertical elliptical pooling contour'} at ${settings.orientation} degrees, frequency ${settings.frequency} cycles per degree, contrast ${settings.contrast}, phase ${settings.phase} degrees`);
}
function render() {
  for(const key of Object.keys(settings)) {
    byId('input-'+key).value=settings[key];
    byId('input-'+key+'-value').value=key==='contrast'?`${Math.round(settings[key]*100)}%`:key==='frequency'?`${settings[key].toFixed(2)} cycles/°`:`${settings[key]}°`;
  }
  byId('input-angle').value=settings.orientation;
  byId('input-angle-value').value=`${settings.orientation}°`;
  paint('input-overlay',false);paint('input-contributions',true);
  byId('input-sum').value=inputResponse(settings).toFixed(3);
  document.querySelectorAll('[data-input-angle]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.inputAngle)===settings.orientation)));
}
if(typeof document!=='undefined' && byId('input-overlay')) {
  Object.keys(settings).forEach(key=>byId('input-'+key).addEventListener('input',event=>{settings[key]=Number(event.target.value);render();}));
  byId('input-angle').addEventListener('input',event=>{settings.orientation=Number(event.target.value);render();});
  document.querySelectorAll('[data-input-angle]').forEach(b=>b.addEventListener('click',()=>{settings.orientation=Number(b.dataset.inputAngle);render();}));
  byId('input-reset').addEventListener('click',()=>{Object.assign(settings,defaults);render();});
  render();
}
