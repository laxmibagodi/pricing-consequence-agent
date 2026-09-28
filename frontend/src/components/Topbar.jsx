import { Menu } from 'lucide-react';

const PAGE_LABELS = {
  analyze:  'Analyze',
  history:  'Decision History',
  outcomes: 'Record Outcome',
};

/**
 * Topbar — fixed top bar with breadcrumb and status badge.
 *
 * Props:
 *   activePage       — 'analyze' | 'history' | 'outcomes'
 *   onMobileToggle   — () => void
 */
export default function Topbar({ activePage, onMobileToggle }) {
  const pageLabel = PAGE_LABELS[activePage] || 'Analyze';

  return (
    <header className="topbar" role="banner">
      <div className="topbar__left">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="topbar__mobile-toggle"
          onClick={onMobileToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div className="topbar__breadcrumb" aria-label="Breadcrumb">
          <span>Workspace</span>
          <span className="topbar__breadcrumb-sep" aria-hidden="true">/</span>
          <span className="topbar__breadcrumb-page">{pageLabel}</span>
        </div>
      </div>

      <div className="topbar__right">
        {/* Memory status */}
        <div
          className="topbar__status"
          role="status"
          aria-label="Memory connection status: online"
        >
          <span className="topbar__status-dot" aria-hidden="true" />
          <span>Memory connected</span>
        </div>

        <span className="topbar__product-name" aria-hidden="true">
          Hindsight Memory
        </span>
      </div>
    </header>
  );
}
