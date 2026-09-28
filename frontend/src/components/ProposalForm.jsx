import { ArrowRight } from 'lucide-react';
import LoadingState from './LoadingState.jsx';
import FileUpload from './FileUpload.jsx';

const MAX_LENGTH = 2000;

const EXAMPLE_CHIPS = [
  '20% discount for new customers',
  '15% discount for SMB customers',
  'Bundle two products for a lower price',
  'Offer a free trial',
  'Increase enterprise pricing by 10%',
];

/**
 * ProposalForm — proposal input card with text entry AND file upload.
 *
 * File upload extracts text browser-side (PDF/DOCX/TXT) and populates
 * the textarea. All existing functionality is preserved.
 *
 * Props:
 *   proposal      — string
 *   setProposal   — (value: string) => void
 *   onSubmit      — () => void
 *   isAnalyzing   — boolean
 */
export default function ProposalForm({
  proposal,
  setProposal,
  onSubmit,
  isAnalyzing,
}) {
  const charCount  = proposal.length;
  const isDisabled = isAnalyzing || charCount === 0 || charCount > MAX_LENGTH;
  const isNearLimit = charCount > MAX_LENGTH * 0.85;

  function handleChipClick(text) { setProposal(text); }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (!isDisabled) onSubmit();
    }
  }

  return (
    <div className="proposal-card">
      <h2 className="proposal-card__heading">What are you considering?</h2>
      <p className="proposal-card__desc">
        Describe the pricing change you want to evaluate, or upload a document.
      </p>

      {/* ---- Text input ------------------------------------ */}
      <label htmlFor="proposal-input" className="proposal-form__label">
        Proposed pricing change
      </label>

      <textarea
        id="proposal-input"
        className="proposal-form__textarea"
        value={proposal}
        onChange={(e) => setProposal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Offer a 20% discount to all new customers"
        maxLength={MAX_LENGTH + 100}
        rows={4}
        aria-describedby="proposal-counter proposal-hint"
        disabled={isAnalyzing}
      />

      <div className="proposal-form__meta">
        <span id="proposal-hint" className="sr-only">
          Press Ctrl+Enter or Cmd+Enter to analyze. Maximum {MAX_LENGTH} characters.
        </span>
        <span
          id="proposal-counter"
          className={`proposal-form__counter${isNearLimit ? ' proposal-form__counter--warn' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {charCount} / {MAX_LENGTH}
        </span>
      </div>

      {/* ---- File upload ----------------------------------- */}
      <div className="proposal-form__upload-row">
        <span className="proposal-form__upload-label">or</span>
        <FileUpload
          onExtracted={(text) => setProposal(text)}
          disabled={isAnalyzing}
        />
      </div>

      {/* ---- Quick suggestions ----------------------------- */}
      <div className="proposal-form__chips-label">Quick suggestions</div>
      <div className="proposal-form__chips" role="group" aria-label="Example proposals">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className="chip"
            onClick={() => handleChipClick(chip)}
            disabled={isAnalyzing}
            aria-label={`Use example: ${chip}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ---- Analyzing state ------------------------------- */}
      {isAnalyzing && <LoadingState />}

      {/* ---- Submit ---------------------------------------- */}
      <div className="proposal-form__actions">
        <span className="proposal-form__hint" aria-hidden="true">
          Ctrl + Enter to analyze
        </span>
        <button
          type="button"
          id="analyze-btn"
          className="btn btn--primary btn--lg"
          onClick={onSubmit}
          disabled={isDisabled}
          aria-busy={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Searching pricing memory…
            </>
          ) : (
            <>
              Analyze Decision
              <ArrowRight size={16} className="btn-arrow" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
