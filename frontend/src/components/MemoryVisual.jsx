import { Search, Database, Lightbulb } from 'lucide-react';

/**
 * MemoryVisual — animated diagram showing the proposal→memory→insight flow.
 * Pure CSS/SVG/icons, no external images.
 * Shown beside the proposal card on desktop.
 */
export default function MemoryVisual() {
  return (
    <div className="memory-visual" aria-hidden="true">
      <div className="memory-visual__title">How it works</div>

      {/* Step 1 — Proposal */}
      <div className="memory-visual__node">
        <div className="memory-visual__node-box memory-visual__node-box--accent">
          <Search size={13} />
          Current proposal
        </div>
      </div>

      {/* Arrow down */}
      <div className="memory-visual__connector" />

      {/* Step 2 — Memory search */}
      <div className="memory-visual__node memory-visual__pulse">
        <div className="memory-visual__node-box">
          <Database size={13} />
          Search memory
        </div>
      </div>

      {/* Fan out to past decisions */}
      <div className="memory-visual__fan">
        <div className="memory-visual__fan-line" />
        <div className="memory-visual__fan-item">
          <div className="memory-visual__fan-node">Past<br />decision</div>
        </div>
        <div className="memory-visual__fan-item" style={{ marginTop: '10px' }}>
          <div className="memory-visual__fan-node">Past<br />decision</div>
        </div>
        <div className="memory-visual__fan-item">
          <div className="memory-visual__fan-node">Past<br />decision</div>
        </div>
      </div>

      {/* Arrow down */}
      <div className="memory-visual__connector" style={{ marginTop: '6px' }} />

      {/* Step 3 — Insight */}
      <div className="memory-visual__node">
        <div className="memory-visual__node-box memory-visual__node-box--ok">
          <Lightbulb size={13} />
          Evidence &amp; insight
        </div>
      </div>
    </div>
  );
}
