/** Teaching models for equations (6)–(14). Angles in degrees at this API boundary. */
export const angles = Array.from({ length: 36 }, (_, i) => i * 5);
export const rad = degrees => degrees * Math.PI / 180;
export const positive = value => Math.max(0, value);

/** Equation (6): unnormalized response of a unit-integral Gaussian field. */
export function gaussianResponse(angle, parallel, perpendicular, k = 1, preferred = 90) {
  const delta = rad(angle - preferred);
  return Math.exp(-k * k / 2 * (parallel ** 2 * Math.sin(delta) ** 2
    + perpendicular ** 2 * Math.cos(delta) ** 2));
}

/** Equation (8): normalized spatial response plus explicitly chosen baseline. */
export function feedforward(angle, anisotropy = 3, preferred = 90) {
  return 0.15 + 0.85 * Math.exp(-anisotropy * Math.sin(rad(angle - preferred)) ** 2);
}
export function thresholdCurve(anisotropy = 3, threshold = 0.3) {
  return angles.map(angle => positive(feedforward(angle, anisotropy) - threshold));
}
export function kernel(delta, gain = 0) {
  return gain * (0.3 + 1.2 * Math.cos(2 * rad(delta)));
}
export function weights(gain = 0) {
  return angles.map(a => angles.map(b => kernel(a - b, gain) / angles.length));
}
/** Equation (11): simultaneous rates, fixed T=0.2, tau in ms. */
export function derivative(rates, matrix, stimulus = 90, tau = 20) {
  return rates.map((rate, i) => {
    const recurrent = matrix[i].reduce((sum, w, j) => sum + w * rates[j], 0);
    return (-rate + positive(feedforward(angles[i], 3, stimulus) - 0.2 + recurrent)) / tau;
  });
}
export function step(rates, matrix, stimulus = 90, dt = 1, tau = 20) {
  const change = derivative(rates, matrix, stimulus, tau);
  return rates.map((rate, i) => rate + dt * change[i]);
}
export function steady(gain = 0, stimulus = 90) {
  let rates = angles.map(() => 0);
  const matrix = weights(gain);
  for (let i = 0; i < 1000; i++) rates = step(rates, matrix, stimulus);
  return rates;
}
/** Record state before stepping: intervention at 200 ms affects the next step. */
export function trace(gain = 0.8, mode = 'switch', dt = 1) {
  let rates = angles.map(() => 0);
  const matrix = weights(gain), off = weights(0), output = [];
  for (let i = 0; i <= Math.round(500 / dt); i++) {
    const t = i * dt;
    output.push([t, rates[18]]);
    rates = step(rates, mode === 'off' && t >= 200 ? off : matrix,
      mode === 'switch' && t >= 200 ? 30 : 90, dt);
  }
  return output;
}
export function normalize(values) {
  const peak = Math.max(...values);
  return values.map(value => peak > 0 ? value / peak : 0);
}

