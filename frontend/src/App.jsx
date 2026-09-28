import { useState, useEffect, useRef } from 'react';

import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import MemoryVisual from './components/MemoryVisual.jsx';
import ProposalForm from './components/ProposalForm.jsx';
import AnalysisResult from './components/AnalysisResult.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import History from './components/History.jsx';
import OutcomeForm from './components/OutcomeForm.jsx';

import { askProposal, getHistory, submitOutcome } from './services/api.js';

// ---- Initial state --------------------------------------------------
const EMPTY_OUTCOME = {
  proposal: '',
  outcome: '',
  revenue_impact: '',
  retention_impact: '',
};

export default function App() {
  // ---- Navigation state -----------------------------------------
  const [activePage, setActivePage]         = useState('analyze');
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  // ---- Proposal / analysis state --------------------------------
  const [proposal, setProposal]             = useState('');
  const [analysis, setAnalysis]             = useState(null);
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [analysisError, setAnalysisError]   = useState(null);

  // ---- History state --------------------------------------------
  const [history, setHistory]               = useState([]);
  const [isLoadingHistory, setIsLoadingHistory]     = useState(true);
  const [isRefreshingHistory, setIsRefreshingHistory] = useState(false);
  const [historyError, setHistoryError]     = useState(null);

  // ---- Outcome state --------------------------------------------
  const [outcomeData, setOutcomeData]       = useState(EMPTY_OUTCOME);
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeSuccess, setOutcomeSuccess] = useState(false);
  const [outcomeError, setOutcomeError]     = useState(null);

  // ---- Results scroll ref ---------------------------------------
  const resultsRef = useRef(null);

  // ---- Load history on mount ------------------------------------
  useEffect(() => {
    fetchHistory(false);
  }, []);

  // ---- Scroll to top of results when analysis completes ----------
  useEffect(() => {
    if (analysis && !isAnalyzing) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [analysis, isAnalyzing]);

  // ----------------------------------------------------------------
  // History fetch — identical logic to original
  // ----------------------------------------------------------------
  async function fetchHistory(isRefresh = false) {
    if (isRefresh) {
      setIsRefreshingHistory(true);
    } else {
      setIsLoadingHistory(true);
    }
    setHistoryError(null);

    try {
      const data = await getHistory();
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const da = a.date ? new Date(a.date) : 0;
            const db = b.date ? new Date(b.date) : 0;
            return db - da;
          })
        : [];
      setHistory(sorted);
    } catch (err) {
      setHistoryError(err?.message || 'Unable to load decision history.');
    } finally {
      setIsLoadingHistory(false);
      setIsRefreshingHistory(false);
    }
  }

  // ----------------------------------------------------------------
  // Analyze proposal — identical logic to original
  // ----------------------------------------------------------------
  async function handleAnalyze() {
    if (!proposal.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      const result = await askProposal(proposal.trim());
      setAnalysis(result);

      // Pre-fill outcome form with the analyzed proposal
      setOutcomeData((prev) => ({ ...prev, proposal: proposal.trim() }));
    } catch (err) {
      setAnalysisError(
        err?.message || 'Unable to analyze this proposal right now. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  // ----------------------------------------------------------------
  // Outcome submission — identical logic to original
  // ----------------------------------------------------------------
  async function handleSubmitOutcome() {
    if (!outcomeData.proposal?.trim() || !outcomeData.outcome?.trim()) return;
    if (isSubmittingOutcome) return;

    setIsSubmittingOutcome(true);
    setOutcomeError(null);
    setOutcomeSuccess(false);

    try {
      await submitOutcome({
        proposal:          outcomeData.proposal.trim(),
        outcome:           outcomeData.outcome.trim(),
        revenue_impact:    outcomeData.revenue_impact?.trim()   || undefined,
        retention_impact:  outcomeData.retention_impact?.trim() || undefined,
      });

      setOutcomeSuccess(true);

      setOutcomeData((prev) => ({
        ...prev,
        outcome: '',
        revenue_impact: '',
        retention_impact: '',
      }));

      // Refresh history so the new decision appears
      await fetchHistory(true);
    } catch (err) {
      setOutcomeError(
        err?.message || 'Unable to record this outcome right now. Please try again.'
      );
    } finally {
      setIsSubmittingOutcome(false);
    }
  }

  // ----------------------------------------------------------------
  // Outcome field patcher — merges partial patch
  // ----------------------------------------------------------------
  function patchOutcome(patch) {
    setOutcomeData((prev) => ({ ...prev, ...patch }));
    if (outcomeSuccess) setOutcomeSuccess(false);
    if (outcomeError)   setOutcomeError(null);
  }

  // ----------------------------------------------------------------
  // Navigate to outcomes page
  // ----------------------------------------------------------------
  function navigateToOutcomes() {
    setActivePage('outcomes');
    setSidebarOpen(false);
  }

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <div className="app-shell">
      {/* Fixed topbar */}
      <Topbar
        activePage={activePage}
        onMobileToggle={() => setSidebarOpen((v) => !v)}
      />

      <div className="app-body">
        {/* Fixed sidebar */}
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          historyCount={history.length}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main scrollable area */}
        <main className="main-content" id="top">

          {/* ---- ANALYZE PAGE --------------------------------- */}
          {activePage === 'analyze' && (
            <div className="page-content">
              {/* Page hero */}
              <div className="page-hero">
                <div className="page-hero__eyebrow">Pricing Intelligence</div>
                <h1 className="page-hero__heading">
                  Make pricing decisions{' '}
                  <em>with memory.</em>
                </h1>
                <p className="page-hero__sub">
                  Search previous pricing experiments, understand what happened,
                  and bring historical evidence into your next pricing decision.
                </p>
              </div>

              {/* Two-column: proposal card + memory visual */}
              <div className="analyze-layout">
                <div>
                  <ProposalForm
                    proposal={proposal}
                    setProposal={setProposal}
                    onSubmit={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
                <div className="memory-visual-col">
                  <MemoryVisual />
                </div>
              </div>

              {/* Results area */}
              <div
                ref={resultsRef}
                aria-live="polite"
                aria-atomic="false"
                style={{ outline: 'none' }}
                tabIndex={-1}
              >
                {analysisError && !isAnalyzing && (
                  <div className="results-section">
                    <ErrorMessage
                      message={analysisError}
                      onRetry={handleAnalyze}
                    />
                  </div>
                )}

                {analysis && !isAnalyzing && !analysisError && (
                  <AnalysisResult
                    data={analysis}
                    onScrollToOutcome={navigateToOutcomes}
                    onEditProposal={() => {
                      // Scroll / focus the proposal textarea
                      document.getElementById('proposal-input')?.focus();
                    }}
                  />
                )}

                {!analysis && !isAnalyzing && !analysisError && (
                  <EmptyAnalysisHint />
                )}
              </div>
            </div>
          )}

          {/* ---- HISTORY PAGE --------------------------------- */}
          {activePage === 'history' && (
            <div className="page-content">
              <History
                history={history}
                isLoading={isLoadingHistory}
                error={historyError}
                onRefresh={() => fetchHistory(true)}
                isRefreshing={isRefreshingHistory}
              />
            </div>
          )}

          {/* ---- OUTCOMES PAGE -------------------------------- */}
          {activePage === 'outcomes' && (
            <div className="page-content">
              <OutcomeForm
                outcome={outcomeData}
                setOutcome={patchOutcome}
                onSubmit={handleSubmitOutcome}
                isSubmitting={isSubmittingOutcome}
                submitSuccess={outcomeSuccess}
                submitError={outcomeError}
              />
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="footer__inner">
          <span className="footer__brand">Pricing Consequence Agent</span>
          <span className="footer__note">
            Evidence-based pricing decisions, powered by historical memory.
          </span>
        </div>
      </footer>
    </div>
  );
}

/**
 * Empty state shown before any analysis is run.
 */
function EmptyAnalysisHint() {
  return (
    <div className="empty-hint" style={{ marginTop: '32px' }}>
      <div className="empty-hint__icon" aria-hidden="true">
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <p className="empty-hint__text">
        Enter a proposal above to search historical pricing decisions.
      </p>
    </div>
  );
}
