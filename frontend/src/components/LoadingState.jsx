import { useEffect, useState } from 'react';

const STEPS = [
  'Analyzing historical decisions…',
  'Recalling similar outcomes…',
  'Building decision analysis…',
];

/**
 * LoadingState — animated multi-step indicator shown during /ask.
 * Cycles through STEPS every 1.8 s so the UI feels active.
 */
export default function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="analyzing-state"
      role="status"
      aria-live="polite"
      aria-label={STEPS[stepIndex]}
    >
      <div className="analyzing-state__dots" aria-hidden="true">
        <span className="analyzing-state__dot" />
        <span className="analyzing-state__dot" />
        <span className="analyzing-state__dot" />
      </div>
      <span
        key={stepIndex}           /* key change triggers the fade animation */
        className="analyzing-state__text analyzing-state__text--fade"
        aria-hidden="true"        /* full text already in aria-label above */
      >
        {STEPS[stepIndex]}
      </span>
    </div>
  );
}
