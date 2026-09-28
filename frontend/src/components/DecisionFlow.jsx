import { Check, Minus, TriangleAlert } from 'lucide-react';

/**
 * DecisionFlow — dynamic IF/ELSE decision tree visualisation.
 *
 * Built entirely from the API response — no hardcoded outcomes.
 * The tree structure is derived from:
 *   has_evidence, contradictions.length, verdict
 *
 * Props:
 *   verdict        — 'supported' | 'mixed' | 'no_precedent'
 *   hasEvidence    — boolean
 *   evidenceCount  — number
 *   contradictions — string[]
 *   confidence     — number 0–1
 */
export default function DecisionFlow({
  verdict,
  hasEvidence,
  evidenceCount,
  contradictions,
  confidence,
}) {
  const pct = Math.round((confidence ?? 0) * 100);
  const hasContradictions = contradictions && contradictions.length > 0;

  return (
    <div className="decision-flow" aria-label="Decision flow diagram" role="img">
      <div className="decision-flow__title">Decision Flow</div>

      {/* Root */}
      <FlowNode label="Proposal" type="root" />
      <FlowConnector />

      {/* Branch: evidence found? */}
      <FlowDecision question="Similar historical decisions?" />

      <div className="decision-flow__branches">
        {/* LEFT — evidence found */}
        <div className="decision-flow__branch">
          <div className="decision-flow__branch-label decision-flow__branch-label--yes">YES</div>
          <div className="decision-flow__branch-line" />

          {hasEvidence ? (
            <>
              <FlowNode
                label={`${evidenceCount} decision${evidenceCount !== 1 ? 's' : ''} found`}
                type="info"
              />
              <FlowConnector short />
              <FlowDecision question="Outcomes consistent?" />

              <div className="decision-flow__branches decision-flow__branches--inner">
                {/* YES — supported */}
                <div className="decision-flow__branch">
                  <div className="decision-flow__branch-label decision-flow__branch-label--yes">YES</div>
                  <div className="decision-flow__branch-line" />
                  <FlowVerdict
                    active={verdict === 'supported'}
                    type="supported"
                    label="SUPPORTED"
                    icon={Check}
                    pct={pct}
                  />
                </div>

                {/* NO — mixed */}
                <div className="decision-flow__branch">
                  <div className="decision-flow__branch-label decision-flow__branch-label--no">NO</div>
                  <div className="decision-flow__branch-line" />
                  <FlowVerdict
                    active={verdict === 'mixed'}
                    type="mixed"
                    label="CAUTION"
                    icon={TriangleAlert}
                    pct={pct}
                  />
                </div>
              </div>

              {/* Current path indicator */}
              {hasContradictions && (
                <div className="decision-flow__path-note">
                  <TriangleAlert size={12} aria-hidden="true" />
                  {contradictions.length} conflicting outcome{contradictions.length !== 1 ? 's' : ''} detected
                </div>
              )}
            </>
          ) : (
            /* Transient state — evidence branch not yet resolved */
            <FlowNode label="Searching…" type="info" />
          )}
        </div>

        {/* RIGHT — no evidence */}
        <div className="decision-flow__branch">
          <div className="decision-flow__branch-label decision-flow__branch-label--no">NO</div>
          <div className="decision-flow__branch-line" />
          <FlowVerdict
            active={verdict === 'no_precedent'}
            type="no_precedent"
            label="NO PRECEDENT"
            icon={Minus}
            pct={0}
          />
        </div>
      </div>

      {/* Active verdict highlight */}
      <ActiveVerdictSummary verdict={verdict} pct={pct} />
    </div>
  );
}

// ---- Sub-components ----------------------------------------

function FlowNode({ label, type }) {
  return (
    <div className={`flow-node flow-node--${type}`}>
      {label}
    </div>
  );
}

function FlowConnector({ short }) {
  return <div className={`flow-connector${short ? ' flow-connector--short' : ''}`} />;
}

function FlowDecision({ question }) {
  return (
    <div className="flow-decision">
      <span>{question}</span>
    </div>
  );
}

function FlowVerdict({ active, type, label, icon: Icon, pct }) {
  return (
    <div className={`flow-verdict flow-verdict--${type}${active ? ' flow-verdict--active' : ''}`}>
      <Icon size={13} aria-hidden="true" />
      <span>{label}</span>
      {active && pct > 0 && (
        <span className="flow-verdict__pct">{pct}%</span>
      )}
    </div>
  );
}

function ActiveVerdictSummary({ verdict, pct }) {
  if (verdict === 'no_precedent') return null;

  const LABELS = {
    supported: { text: 'Evidence supports this direction.', cls: 'flow-summary--supported' },
    mixed:     { text: 'Outcomes conflict — proceed with caution.', cls: 'flow-summary--mixed' },
  };
  const cfg = LABELS[verdict];
  if (!cfg) return null;

  return (
    <div className={`flow-summary ${cfg.cls}`}>
      <span className="flow-summary__text">{cfg.text}</span>
      <span className="flow-summary__conf">Confidence: {pct}%</span>
    </div>
  );
}
