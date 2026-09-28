import { CircleCheck, ArrowRight } from 'lucide-react';

const PROCESS_STEPS = [
  { label: 'Proposal', active: false },
  { label: 'Experiment', active: false },
  { label: 'Actual outcome', active: true },
  { label: 'Record', active: false },
  { label: 'Future memory', active: false },
];

/**
 * OutcomeForm — "Close the loop" page.
 * Shows process flow visual + premium form.
 * All existing API behavior preserved exactly.
 *
 * Props:
 *   outcome           — { proposal, outcome, revenue_impact, retention_impact }
 *   setOutcome        — (patch: object) => void
 *   onSubmit          — () => void
 *   isSubmitting      — boolean
 *   submitSuccess     — boolean
 *   submitError       — string | null
 */
export default function OutcomeForm({
  outcome,
  setOutcome,
  onSubmit,
  isSubmitting,
  submitSuccess,
  submitError,
}) {
  const { proposal, outcome: outcomeText, revenue_impact, retention_impact } = outcome;
  const isDisabled = isSubmitting || !proposal?.trim() || !outcomeText?.trim();

  function handleField(field) {
    return (e) => setOutcome({ [field]: e.target.value });
  }

  return (
    <section id="outcomes" aria-labelledby="outcome-heading">
      {/* Page hero */}
      <div className="page-hero">
        <div className="page-hero__eyebrow">Memory loop</div>
        <h2 id="outcome-heading" className="page-hero__heading">
          Close the loop.
        </h2>
        <p className="page-hero__sub">
          Every experiment becomes memory for the next pricing decision.
        </p>
      </div>

      {/* Process visual */}
      <div className="outcome-process" aria-hidden="true">
        {PROCESS_STEPS.map((step, i) => (
          <div key={step.label} className="outcome-process__step">
            <span
              className={`outcome-process__bubble${step.active ? ' outcome-process__bubble--active' : ''}`}
            >
              {step.label}
            </span>
            {i < PROCESS_STEPS.length - 1 && (
              <ArrowRight size={13} className="outcome-process__arrow" />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="outcome-form-card">
        <form
          onSubmit={(e) => { e.preventDefault(); if (!isDisabled) onSubmit(); }}
          aria-label="Record pricing outcome"
          noValidate
        >
          {/* Proposal */}
          <div className="form-field">
            <label htmlFor="outcome-proposal" className="form-label">
              Proposal
            </label>
            <textarea
              id="outcome-proposal"
              className="form-textarea"
              value={proposal}
              onChange={handleField('proposal')}
              placeholder="Describe the pricing change that was made…"
              rows={3}
              disabled={isSubmitting}
              required
              aria-required="true"
            />
          </div>

          {/* Actual outcome */}
          <div className="form-field">
            <label htmlFor="outcome-result" className="form-label">
              Actual outcome
            </label>
            <textarea
              id="outcome-result"
              className="form-textarea"
              value={outcomeText}
              onChange={handleField('outcome')}
              placeholder="Acquisition increased, but expansion revenue declined."
              rows={3}
              disabled={isSubmitting}
              required
              aria-required="true"
            />
          </div>

          {/* Revenue + retention (optional) */}
          <div className="form-row">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="outcome-revenue" className="form-label">
                Revenue impact <span>(optional)</span>
              </label>
              <input
                id="outcome-revenue"
                type="text"
                className="form-input"
                value={revenue_impact}
                onChange={handleField('revenue_impact')}
                placeholder="+12%"
                disabled={isSubmitting}
                aria-describedby="revenue-hint"
              />
              <span id="revenue-hint" className="sr-only">
                e.g. +12% or no change
              </span>
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="outcome-retention" className="form-label">
                Retention impact <span>(optional)</span>
              </label>
              <input
                id="outcome-retention"
                type="text"
                className="form-input"
                value={retention_impact}
                onChange={handleField('retention_impact')}
                placeholder="-3%"
                disabled={isSubmitting}
                aria-describedby="retention-hint"
              />
              <span id="retention-hint" className="sr-only">
                e.g. -3% or improved
              </span>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="error-callout" role="alert" style={{ marginTop: '20px' }}>
              <p className="error-callout__title">Could not record outcome</p>
              <p className="error-callout__body">{submitError}</p>
            </div>
          )}

          {/* Success */}
          {submitSuccess && (
            <div
              className="success-callout"
              role="status"
              aria-live="polite"
              style={{ marginTop: '20px' }}
            >
              <CircleCheck size={18} className="success-callout__icon" aria-hidden="true" />
              <div>
                <p className="success-callout__title">Outcome recorded</p>
                <p className="success-callout__body">
                  This decision is now available for future pricing analysis.
                </p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn--primary btn--lg"
              disabled={isDisabled}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Saving to memory…
                </>
              ) : (
                <>
                  Record Outcome
                  <ArrowRight size={15} className="btn-arrow" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
