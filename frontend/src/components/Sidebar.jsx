import { Sparkles, Clock, CircleCheck, Brain } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'analyze',  label: 'Analyze',          icon: Sparkles },
  { id: 'history',  label: 'Decision History', icon: Clock    },
  { id: 'outcomes', label: 'Record Outcome',   icon: CircleCheck },
];

/**
 * Sidebar — fixed left navigation panel.
 *
 * Props:
 *   activePage    — 'analyze' | 'history' | 'outcomes'
 *   onNavigate    — (pageId: string) => void
 *   historyCount  — number (actual decision count from API)
 *   isOpen        — boolean (mobile drawer open state)
 *   onClose       — () => void
 */
export default function Sidebar({
  activePage,
  onNavigate,
  historyCount,
  isOpen,
  onClose,
}) {
  // Compute unique segment count from history (passed as prop)
  // historyCount is a number; we can only show decisions stored.

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${isOpen ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar${isOpen ? ' is-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon" aria-hidden="true">
            <Brain size={18} />
          </div>
          <span className="sidebar__brand-name">Pricing Consequence Agent</span>
          <div className="sidebar__brand-tagline">AI Decision Intelligence</div>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav" aria-label="Application sections">
          <div className="sidebar__nav-label">Navigation</div>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`sidebar__nav-item${activePage === id ? ' is-active' : ''}`}
              onClick={() => { onNavigate(id); onClose(); }}
              aria-current={activePage === id ? 'page' : undefined}
              aria-label={label}
            >
              <Icon
                size={16}
                className="sidebar__nav-icon"
                aria-hidden="true"
              />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer — memory stats */}
        <div className="sidebar__footer">
          <div className="sidebar__memory-block">
            <div className="sidebar__memory-label">Memory</div>
            <div className="sidebar__memory-stat">
              <span className="sidebar__memory-num">{historyCount}</span>
              <span className="sidebar__memory-desc">decisions stored</span>
            </div>
          </div>
          <div className="sidebar__status">
            <span className="sidebar__status-dot" aria-hidden="true" />
            System online
          </div>
        </div>
      </aside>
    </>
  );
}
