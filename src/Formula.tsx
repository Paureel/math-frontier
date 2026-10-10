import formulas from 'virtual:frontier-formulas';
import 'katex/dist/katex.min.css';
// Only the fixed editorial formula catalogue supplies HTML. Upstream/API text
// never reaches an HTML renderer. KaTeX runs at build time instead of per visit.
export default function Formula({value}:{value:string}){const html=formulas[value];return html?<span className="math" dangerouslySetInnerHTML={{__html:html}}/>:<span className="math">{value}</span>;}
