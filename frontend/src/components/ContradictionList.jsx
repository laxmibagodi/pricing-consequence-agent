import { TriangleAlert } from 'lucide-react';

/**
 * ContradictionList — prominent warning section for conflicting outcomes.
 * Never hides contradictions. Never implies which outcome is correct.
 *
 * Props:
 *   contradictions — string[]
 */
export default function ContradictionList({ contradictions }) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div
      className="contradictions-section"
      role="region"
      aria-labelledby="contradictions-heading"
    >
      <div className="contradictions-section__header">
        <TriangleAlert
          size={18}
          className="contradictions-section__icon"
          aria-hidden="true"
        />
        <h3 id="contradictions-heading" className="contradictions-section__title">
          Conflicting outcomes
        </h3>
      </div>
      <ul className="contradiction-list" aria-label="Conflicting historical outcomes">
        {contradictions.map((item, i) => (
          <li key={i} className="contradiction-item">
            <span className="contradiction-item__bullet" aria-hidden="true" />
            <p className="contradiction-item__text">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
