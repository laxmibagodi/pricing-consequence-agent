import { RefreshCw, ClockFading } from 'lucide-react';

/**
 * History — upgraded decision history page.
 * Includes stats header, timeline layout, premium cards.
 * All data from API — nothing fabricated.
 *
 * Props:
 *   history        — array of { pricing_change, target_segment, actual_effect, date, id }
 *   isLoading      — boolean
 *   error          — string | null
 *   onRefresh      — () => void
 *   isRefreshing   — boolean
 */
export default function History({
  history,
  isLoading,
  error,
  onRefresh,
  isRefreshing,
}) {
  // Derive stats from actual data only
  const decisionCount = history.length;
  const segmentCount  = countUniqueSegments(history);

  return (
    <section id="history" aria-labelledby="history-heading">
      {/* Page hero */}
      <div className="page-hero">
        <div className="page-hero__eyebrow">Memory archive</div>
        <h2 id="history-heading" className="page-hero__heading">
          Decision History
        </h2>
        <p className="page-hero__sub">
          Every pricing experiment becomes future context.
        </p>
      </div>

      {/* Stats — only if there is data */}
      {!isLoading && decisionCount > 0 && (
        <div className="history-stats" aria-label="Memory statistics">
          <div className="history-stat-card">
            <div className="history-stat-card__num">{decisionCount}</div>
            <div className="history-stat-card__label">Decisions</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-card__num">{segmentCount}</div>
            <div className="history-stat-card__label">Segments</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-card__num">{decisionCount}</div>
            <div className="history-stat-card__label">Recorded</div>
          </div>
        </div>
      )}

      {/* Header with refresh */}
      <div className="history-header">
        <div>
          <h3 className="section__title">All decisions</h3>
          <p className="section__subtitle">Newest first.</p>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          aria-label="Refresh decision history"
          aria-busy={isRefreshing}
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
            style={{ animation: isRefreshing ? 'spin 0.65s linear infinite' : 'none' }}
          />
          {isRefreshing ? 'Refreshing…' : 'Refresh history'}
        </button>
      </div>

      {/* Error */}
      {error && !isLoading && (
        <div className="error-callout" role="alert" style={{ marginBottom: '16px' }}>
          <p className="error-callout__title">Unable to load history</p>
          <p className="error-callout__body">{error}</p>
        </div>
      )}

      {/* Skeleton */}
      {isLoading && <HistorySkeleton />}

      {/* Empty */}
      {!isLoading && !error && history.length === 0 && (
        <div className="history-empty" role="status">
          <ClockFading
            size={28}
            aria-hidden="true"
            style={{ color: 'var(--muted-light)', display: 'block', margin: '0 auto 12px' }}
          />
          No decisions recorded yet.
        </div>
      )}

      {/* Timeline */}
      {!isLoading && history.length > 0 && (
        <div
          className="history-timeline"
          role="list"
          aria-label="Historical pricing decisions"
        >
          {history.map((item, i) => (
            <HistoryTimelineItem key={item.id ?? i} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function HistoryTimelineItem({ item }) {
  const { pricing_change, target_segment, actual_effect, date } = item;
  const formattedDate = formatDate(date);

  return (
    <div className="history-timeline-item" role="listitem">
      <div className="history-timeline-dot">
        <div className="history-timeline-dot__inner" aria-hidden="true" />
      </div>
      <div className="history-card">
        {pricing_change && (
          <p className="history-card__title">{pricing_change}</p>
        )}
        {target_segment && (
          <p className="history-card__segment">{target_segment}</p>
        )}
        {actual_effect && (
          <p className="history-card__effect">{actual_effect}</p>
        )}
        {formattedDate && (
          <time
            dateTime={date}
            className="history-card__date"
            aria-label={`Recorded on ${formattedDate}`}
          >
            {formattedDate}
          </time>
        )}
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading history">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-line--medium" />
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--long" />
        </div>
      ))}
    </div>
  );
}

function countUniqueSegments(history) {
  const segments = new Set();
  history.forEach((item) => {
    if (item.target_segment?.trim()) {
      segments.add(item.target_segment.trim().toLowerCase());
    }
  });
  return segments.size || history.length;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
