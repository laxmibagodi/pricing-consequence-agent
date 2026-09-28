import { Check, TriangleAlert, Minus } from 'lucide-react';

/**
 * Maps API verdict strings → display config.
 * Uses icon + text so color is never the only signal (accessibility).
 */
const VERDICTS = {
  supported: {
    icon: Check,
    label: 'Supported',
    badgeClass: 'verdict-card__badge--supported',
    description: 'Historical evidence supports similarity.',
  },
  mixed: {
    icon: TriangleAlert,
    label: 'Mixed',
    badgeClass: 'verdict-card__badge--mixed',
    description: 'Historical evidence is mixed.',
  },
  no_precedent: {
    icon: Minus,
    label: 'No precedent',
    badgeClass: 'verdict-card__badge--no_precedent',
    description: 'No comparable precedent found.',
  },
};

/**
 * VerdictCard
 *
 * Props:
 *   verdict — 'supported' | 'mixed' | 'no_precedent'
 */
export default function VerdictCard({ verdict }) {
  const config = VERDICTS[verdict] || VERDICTS['no_precedent'];
  const Icon = config.icon;

  return (
    <div className="verdict-card" aria-label={`Verdict: ${config.label}`}>
      <div className="verdict-card__label">Historical verdict</div>
      <div className={`verdict-card__badge ${config.badgeClass}`}>
        <Icon size={14} aria-hidden="true" />
        {config.label}
      </div>
      <p className="verdict-card__description">{config.description}</p>
    </div>
  );
}
