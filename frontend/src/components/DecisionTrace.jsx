import { Check, CircleX, TriangleAlert, ArrowRight } from 'lucide-react';

/**
 * DecisionTrace — "Why?" section.
 *
 * Shows a human-readable reasoning chain from the evidence,
 * patterns, and contradictions returned by the API.
 * Nothing is invented — every item comes from the response.
 *
 * Props:
 *   verdict        — 'supported' | 'mixed' | 'no_precedent'
 *   evidence       — Array<{ text, score, metadata }>
 *   patterns       — string[]
 *   contradictions — string[]
 *   confidence     — number 0–1
 */
export default function DecisionTrace({
  verdict,
  evidence,
  patterns,
  contradictions,
  confidence,
}) {
  const pct = Math.round((confidence ?? 0) * 100);

  const traceItems = buildTrace(evidence, patterns, contradictions, verdict);
  if (traceItems.length === 0) return null;

  const VERDICT_LABELS = {
    supported:    { text: 'SUPPORTED',    cls: 'trace-final--supported' },
    mixed:        { text: 'CAUTION',      cls: 'trace-final--mixed'     },
    no_precedent: { text: 'NO PRECEDENT', cls: 'trace-final--none'      },
  };
  const finalCfg = VERDICT_LABELS[verdict] || VERDICT_LABELS['no_precedent'];

  return (
    <div className="decision-trace" aria-label="Decision trace">
      <div className="decision-trace__heading">
        <span className="decision-trace__title">Decision Trace</span>
        <span className="decision-trace__sub">Why this verdict was reached</span>
      </div>

      <ol className="trace-list">
        {traceItems.map((item, i) => (
          <TraceItem key={i} item={item} />
        ))}
      </ol>

      {/* Final verdict line */}
      <div className="trace-final">
        <ArrowRight size={14} aria-hidden="true" className="trace-final__arrow" />
        <span className="trace-final__label">Final verdict:</span>
        <span className={`trace-final__value ${finalCfg.cls}`}>{finalCfg.text}</span>
        {pct > 0 && (
          <span className="trace-final__conf">({pct}% confidence)</span>
        )}
      </div>
    </div>
  );
}

// ---- Build trace items from API data -----------------------

function buildTrace(evidence, patterns, contradictions, verdict) {
  const items = [];

  // Evidence presence
  if (evidence && evidence.length > 0) {
    items.push({
      type: 'ok',
      text: `${evidence.length} similar historical decision${evidence.length !== 1 ? 's' : ''} found in memory`,
    });

    // Best evidence score
    const best = evidence.reduce((a, b) => (a.score > b.score ? a : b), evidence[0]);
    const bestPct = Math.round((best.score ?? 0) * 100);
    if (bestPct >= 70) {
      items.push({
        type: 'ok',
        text: `Strongest match: ${bestPct}% relevance score`,
      });
    }
  } else {
    items.push({
      type: 'none',
      text: 'No sufficiently similar historical decisions found',
    });
  }

  // Patterns (inferences — labelled clearly)
  if (patterns && patterns.length > 0) {
    patterns.slice(0, 2).forEach((p) => {
      items.push({ type: 'ok', text: `Pattern observed: ${p}` });
    });
  }

  // Contradictions
  if (contradictions && contradictions.length > 0) {
    contradictions.forEach((c) => {
      items.push({ type: 'warn', text: c });
    });
  }

  // Verdict rationale
  if (verdict === 'supported' && evidence?.length > 0) {
    items.push({ type: 'ok', text: 'Historical outcomes are consistent — supporting this direction' });
  } else if (verdict === 'mixed') {
    items.push({ type: 'warn', text: 'Outcomes vary across comparable experiments — uncertainty remains' });
  } else if (verdict === 'no_precedent') {
    items.push({ type: 'none', text: 'No precedent — this would be a new experiment' });
  }

  return items;
}

// ---- Single trace item -------------------------------------

const TYPE_CONFIG = {
  ok:   { icon: Check,         cls: 'trace-item--ok',   iconCls: 'trace-icon--ok'   },
  warn: { icon: TriangleAlert, cls: 'trace-item--warn', iconCls: 'trace-icon--warn' },
  bad:  { icon: CircleX,       cls: 'trace-item--bad',  iconCls: 'trace-icon--bad'  },
  none: { icon: Minus,         cls: 'trace-item--none', iconCls: 'trace-icon--none' },
};

import { Minus } from 'lucide-react';

function TraceItem({ item }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG['none'];
  const Icon = cfg.icon;

  return (
    <li className={`trace-item ${cfg.cls}`}>
      <span className={`trace-icon ${cfg.iconCls}`} aria-hidden="true">
        <Icon size={13} />
      </span>
      <span className="trace-text">{item.text}</span>
    </li>
  );
}
