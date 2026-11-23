export function gratingValues({angle,x,y,f,C,phase,mean}) {
  const t=angle*Math.PI/180;
  const distance=-x*Math.sin(t)+y*Math.cos(t);
  const cycles=f*distance, radians=2*Math.PI*cycles, shifted=radians+phase;
  const cosine=Math.cos(shifted), contrast=C*cosine;
  return {distance,cycles,radians,shifted,cosine,contrast,luminance:mean*(1+contrast),minimum:mean*(1-C),maximum:mean*(1+C),spacing:1/f,shift:-phase/(2*Math.PI*f)};
}
