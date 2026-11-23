export function poolingPoint(angle,long,short,x,y){
 const a=angle*Math.PI/180,u=x*Math.cos(a)+y*Math.sin(a),v=-x*Math.sin(a)+y*Math.cos(a);
 const exponent=-.5*((u/long)**2+(v/short)**2),peak=1/(2*Math.PI*long*short);
 return {u,v,exponent,peak,weight:peak*Math.exp(exponent)};
}
