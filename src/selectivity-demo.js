const slider = document.getElementById('selectivity-angle');
const canvas = document.getElementById('selectivity-stimulus');
const svg = document.getElementById('selectivity-curve');
const response = angle => 5 + 95 * Math.exp(-4 * Math.sin((angle - 90) * Math.PI / 180) ** 2);
const x = angle => 52 + angle / 180 * 328;
const y = rate => 248 - rate / 100 * 214;
const text = (a,b,label,attrs='') => `<text x="${a}" y="${b}" ${attrs}>${label}</text>`;
const ticks = [0,45,90,135,180].map(a => `<path d="M${x(a)} 248v5"/>${text(x(a),271,`${a}°`,'text-anchor="middle"')}`).join('');
const levels = [0,50,100].map(r => `<path d="M47 ${y(r)}h5"/>${text(41,y(r)+4,`${r}`,'text-anchor="end"')}`).join('');
const curve = Array.from({length:181},(_,a)=>`${a?'L':'M'}${x(a).toFixed(2)} ${y(response(a)).toFixed(2)}`).join(' ');
svg.innerHTML = `<title>One neuron's illustrative orientation tuning</title><g fill="none" stroke="#111" stroke-width="1"><path d="M52 26V248H380"/>${ticks}${levels}<path d="${curve}" stroke-width="2"/></g>${text(52,16,'Response (% of maximum)')}${text(216,296,'Bar orientation','text-anchor="middle"')}<circle id="selectivity-dot" r="5" fill="#111" stroke="white" stroke-width="2"/>`;
function render() {
  const angle=Number(slider.value), radians=angle*Math.PI/180, rate=response(angle);
  document.getElementById('selectivity-angle-value').value=`${angle}°`;
  slider.setAttribute('aria-valuetext',`${angle} degrees`);
  const ctx=canvas.getContext('2d'), n=canvas.width, pixels=ctx.createImageData(n,n);
  for(let row=0;row<n;row++) for(let col=0;col<n;col++) {
    const px=(col/(n-1)-.5)*6, py=(.5-row/(n-1))*6;
    const gray=127.5*(1+.85*Math.cos(2*Math.PI*(-Math.sin(radians)*px+Math.cos(radians)*py)));
    const i=4*(row*n+col); pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=gray; pixels.data[i+3]=255;
  }
  ctx.putImageData(pixels,0,0);
  canvas.setAttribute('aria-label',`Static striped stimulus at ${angle} degrees counterclockwise from horizontal`);
  const dot=document.getElementById('selectivity-dot'); dot.setAttribute('cx',x(angle)); dot.setAttribute('cy',y(rate));
  svg.setAttribute('aria-label',`Illustrative tuning curve: response at ${angle} degrees is ${Math.round(rate)} percent of maximum; preferred orientation is 90 degrees`);
  document.querySelectorAll('[data-orientation]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.orientation)===angle)));
}
slider.addEventListener('input',render);
document.querySelectorAll('[data-orientation]').forEach(button=>button.addEventListener('click',()=>{slider.value=button.dataset.orientation;render();}));
document.getElementById('selectivity-reset').addEventListener('click',()=>{slider.value=45;render();});
render();
