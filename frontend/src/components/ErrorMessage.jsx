import { CircleAlert } from 'lucide-react';

/**
 * ErrorMessage — clean error callout. Never shows stack traces.
 *
 * Props:
 *   message  — user-facing error string
 *   onRetry  — optional callback for a "Try again" button
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div
      className="error-callout"
      role="alert"
      aria-live="assertive"
    >
      <p className="error-callout__title">
        <CircleAlert size={16} aria-hidden="true" />
        Something went wrong
      </p>
      <p className="error-callout__body">
        {message || 'Unable to complete the request right now. Please try again.'}
      </p>
      {onRetry && (
        <div className="error-callout__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onRetry}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
