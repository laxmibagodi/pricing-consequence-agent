import { useEffect, useRef, useState } from 'react';

/**
 * ConfidenceCard — confidence percentage with animated meter.
 *
 * Props:
 *   confidence — number 0–1 from API (confidence * 100 = %)
 */
export default function ConfidenceCard({ confidence }) {
  const pct = Math.round((confidence ?? 0) * 100);
  const [displayPct, setDisplayPct] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDisplayPct(pct), 80);
    return () => clearTimeout(timerRef.current);
  }, [pct]);

  return (
    <div className="confidence-card" aria-label={`Confidence: ${pct}%`}>
      <div className="confidence-card__label">Confidence</div>
      <div className="confidence-card__value" aria-live="polite">{pct}%</div>
      <div
        className="confidence-card__meter"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence meter: ${pct}%`}
      >
        <div
          className="confidence-card__fill"
          style={{ width: `${displayPct}%` }}
        />
      </div>
      <p className="confidence-card__note">Based on retrieved historical evidence</p>
    </div>
  );
}
