/**
 * EvidenceList — premium evidence cards.
 * All data comes from the API. Nothing is fabricated.
 *
 * Props:
 *   items — Array<{ text: string, score: number, metadata: object }>
 */
export default function EvidenceList({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <>
      <div className="evidence-section-head">
        <h3 className="evidence-section-head__title">Historical Evidence</h3>
        <p className="evidence-section-head__sub">
          Previous pricing decisions that influenced this analysis.
        </p>
      </div>
      <ul className="evidence-list" aria-label="Historical evidence">
        {items.map((item, i) => (
          <EvidenceItem key={i} item={item} />
        ))}
      </ul>
    </>
  );
}

function EvidenceItem({ item }) {
  const { text, score, metadata } = item;
  const pct = Math.round((score ?? 0) * 100);

  const metaEntries = metadata
    ? Object.entries(metadata).filter(([, v]) => v !== null && v !== undefined && v !== '')
    : [];

  // Heuristic: if the text looks like a title (short, no period), show it as header;
  // otherwise show it as body text.
  const isShortTitle = text && text.length < 80 && !text.includes('.');
  const headerText = isShortTitle ? text : null;
  const bodyText   = isShortTitle ? null : text;

  return (
    <li className="evidence-item">
      <div className="evidence-item__header">
        {headerText ? (
          <p className="evidence-item__text">{headerText}</p>
        ) : (
          <p className="evidence-item__text" style={{ textTransform: 'none', letterSpacing: 'normal', fontWeight: 600, fontSize: '13px' }}>
            Historical decision
          </p>
        )}
        <span
          className="evidence-item__score-badge"
          aria-label={`Relevance: ${pct}%`}
        >
          {pct}%
        </span>
      </div>

      {bodyText && (
        <p className="evidence-item__body">{bodyText}</p>
      )}

      {metaEntries.length > 0 && (
        <ul className="evidence-item__meta" aria-label="Decision metadata">
          {metaEntries.map(([key, value]) => (
            <li key={key} className="evidence-item__meta-tag">
              <span className="sr-only">{key}: </span>
              {formatMetaKey(key)}: {String(value)}
            </li>
          ))}
        </ul>
      )}

      <div className="evidence-item__footer">
        <div className="evidence-item__score">
          <span className="evidence-item__score-label">Relevance</span>
          <div
            className="evidence-item__score-bar"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Relevance score: ${pct}%`}
          >
            <div
              className="evidence-item__score-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="evidence-item__score-value">{pct}%</span>
        </div>
      </div>
    </li>
  );
}

function formatMetaKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}
