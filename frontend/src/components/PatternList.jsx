import { Lightbulb } from 'lucide-react';

/**
 * PatternList — renders inferred patterns from evidence.
 * Visually distinguished from raw evidence with INFERENCE label.
 *
 * Props:
 *   patterns — string[]
 */
export default function PatternList({ patterns }) {
  if (!patterns || patterns.length === 0) return null;

  return (
    <section className="patterns-section" aria-labelledby="patterns-heading">
      <div className="section-heading">
        <h3 id="patterns-heading" className="section-heading__title">
          Patterns detected
        </h3>
        <p className="section-heading__sub">
          Inferences drawn from historical evidence — not raw facts.
        </p>
      </div>
      <ul className="pattern-list" aria-label="Observed patterns">
        {patterns.map((pattern, i) => (
          <li key={i} className="pattern-item">
            <div className="pattern-item__icon-wrap" aria-hidden="true">
              <Lightbulb size={15} />
            </div>
            <div className="pattern-item__body">
              <div className="pattern-item__tag">Inference</div>
              <p className="pattern-item__text">{pattern}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
