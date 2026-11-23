import katex from 'katex';
import { equations } from '../src/equations.js';
const options = { throwOnError:true, strict:'error', trust:false, output:'htmlAndMathml' };
const render = (tex, displayMode) => katex.renderToString(tex, { ...options, displayMode });
export function renderMath(html) {
  // Inline math is authored in standard LaTeX delimiters, not raw HTML subscripts.
  html = html.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => render(tex, false));
  return html.replace(/<div class="equation" data-equation="(\d+)"><\/div>/g, (_, id) => {
    const equation = equations[id];
    if (!equation) throw new Error(`Missing equation ${id}`);
    const wide = render(equation.tex, true);
    const compact = equation.compact ? render(equation.compact, true) : null;
    return `<figure class="equation" id="eq-${id}" aria-label="Equation ${id}">
      <div class="equation-body${compact?' has-compact':''}">
        <div class="math-wide">${wide}</div>${compact?`<div class="math-compact">${compact}</div>`:''}
      </div><figcaption class="equation-label"><a href="#eq-${id}" aria-label="Link to equation ${id}">(${id})</a></figcaption>
    </figure>`;
  });
}
