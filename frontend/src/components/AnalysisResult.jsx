import { useEffect, useRef, useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Check, TriangleAlert, Minus } from 'lucide-react';
import EvidenceList from './EvidenceList.jsx';
import PatternList from './PatternList.jsx';
import ContradictionList from './ContradictionList.jsx';
import DecisionFlow from './DecisionFlow.jsx';
import DecisionTrace from './DecisionTrace.jsx';

/**
 * AnalysisResult — full results panel after a successful /ask.
 *
 * Sections (in order):
 *   1. Signal banner   — verdict + confidence + evidence count (dark card)
 *   2. Decision flow   — dynamic IF/ELSE tree
 *   3. Decision trace  — "Why?" reasoning chain
 *   4. Agent response  — Groq natural-language explanation
 *   5. Contradictions  — prominent warning (mixed only)
 *   6. Evidence cards  — historical decisions
 *   7. Patterns        — inferences
 *
 * Props:
 *   data              — full API response from /ask
 *   onScrollToOutcome — () => void
 */
export default function AnalysisResult({ data, onScrollToOutcome }) {
  const {
    response,
    has_evidence,
    evidence = [],
    patterns = [],
    contradictions = [],
    verdict,
    confidence,
  } = data;

  // ---- No precedent -----------------------------------------------
  if (!has_evidence) {
    return (
      <div
        className="results-section"
        role="region"
        aria-label="Analysis result"
        aria-live="polite"
      >
        <NoPrecedentState
          response={response}
          onScrollToOutcome={onScrollToOutcome}
        />
      </div>
    );
  }

  // ---- Evidence state (supported or mixed) ------------------------
  return (
    <div
      className="results-section"
      role="region"
      aria-label="Analysis result"
      aria-live="polite"
    >
      {/* 1. Dark signal banner */}
      <SignalBanner
        verdict={verdict}
        confidence={confidence}
        evidenceCount={evidence.length}
      />

      {/* 2. Decision flow diagram */}
      <DecisionFlow
        verdict={verdict}
        hasEvidence={has_evidence}
        evidenceCount={evidence.length}
        contradictions={contradictions}
        confidence={confidence}
      />

      {/* 3. Decision trace — why this verdict */}
      <DecisionTrace
        verdict={verdict}
        evidence={evidence}
        patterns={patterns}
        contradictions={contradictions}
        confidence={confidence}
      />

      {/* 4. Agent natural-language response */}
      <div className="analysis-main-card">
        <div className="analysis-main-card__eyebrow">Memory-based analysis</div>
        <h2 className="analysis-main-card__title">What the memory shows</h2>
        <p className="analysis-main-card__response">{response}</p>
        {evidence.length > 0 && (
          <p className="analysis-main-card__meta">
            <BookOpen size={13} aria-hidden="true" />
            Historical evidence used: {evidence.length} decision
            {evidence.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* 5. Contradictions */}
      {contradictions.length > 0 && (
        <ContradictionList contradictions={contradictions} />
      )}

      {/* 6. Evidence cards */}
      {evidence.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <EvidenceList items={evidence} />
        </div>
      )}

      {/* 7. Patterns */}
      {patterns.length > 0 && (
        <PatternList patterns={patterns} />
      )}
    </div>
  );
}

/* ---- Signal Banner ------------------------------------------------------- */
const VERDICT_CONFIG = {
  supported: {
    icon: Check,
    label: 'Supported',
    valueClass: 'signal-metric__value--supported',
  },
  mixed: {
    icon: TriangleAlert,
    label: 'Caution',
    valueClass: 'signal-metric__value--mixed',
  },
  no_precedent: {
    icon: Minus,
    label: 'No precedent',
    valueClass: 'signal-metric__value--no_precedent',
  },
};

function SignalBanner({ verdict, confidence, evidenceCount }) {
  const pct = Math.round((confidence ?? 0) * 100);
  const [fillPct, setFillPct] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setFillPct(pct), 120);
    return () => clearTimeout(timerRef.current);
  }, [pct]);

  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG['no_precedent'];
  const Icon = cfg.icon;

  return (
    <div className="signal-banner" aria-label="Historical signal summary">
      <div>
        <div className="signal-banner__label">Historical signal</div>
        <div className="signal-banner__metrics">
          <div className="signal-metric">
            <div className="signal-metric__label">Verdict</div>
            <div className={`signal-metric__value ${cfg.valueClass}`}>
              <Icon size={22} aria-hidden="true" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
              {cfg.label}
            </div>
          </div>

          <div className="signal-metric">
            <div className="signal-metric__label">Confidence</div>
            <div className="signal-metric__value signal-metric__value--pct" aria-live="polite">
              {pct}%
            </div>
          </div>

          {evidenceCount > 0 && (
            <div className="signal-metric">
              <div className="signal-metric__label">Evidence</div>
              <div className="signal-metric__value signal-metric__value--count">
                {evidenceCount}
              </div>
              <div className="signal-metric__sub">similar decisions</div>
            </div>
          )}
        </div>
      </div>

      <div className="signal-banner__confidence">
        <div className="signal-metric__label" style={{ marginBottom: '8px' }}>
          Confidence meter
        </div>
        <div
          className="signal-banner__conf-track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confidence: ${pct}%`}
        >
          <div
            className="signal-banner__conf-fill"
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <div style={{ fontSize: '11px', color: 'var(--dark-muted)', marginTop: '6px' }}>
          Based on retrieved historical evidence
        </div>
      </div>
    </div>
  );
}

/* ---- No Precedent State -------------------------------------------------- */
function NoPrecedentState({ response, onScrollToOutcome }) {
  return (
    <div className="no-precedent">
      <div className="no-precedent__icon" aria-hidden="true">
        <svg
          width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <path d="M11 8v3" />
          <circle cx="11" cy="14.5" r="0.5" fill="currentColor" />
        </svg>
      </div>

      <h2 className="no-precedent__title">No comparable precedent found</h2>
      <p className="no-precedent__body">
        {response ||
          'The current proposal does not closely match pricing decisions currently in memory. Treat this as a new experiment — record the outcome after testing so future decisions can learn from it.'}
      </p>

      <button
        type="button"
        className="no-precedent__cta"
        onClick={onScrollToOutcome}
      >
        Record the outcome after testing
        <ArrowRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
