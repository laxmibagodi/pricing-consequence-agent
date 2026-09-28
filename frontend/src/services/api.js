/**
 * api.js — all backend communication for Pricing Consequence Agent.
 * Backend URL is read from the VITE_API_URL environment variable.
 * Never hardcode the URL in components — always import from here.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Maps HTTP status codes to user-friendly error messages.
 */
function mapErrorMessage(status, defaultMessage) {
  const messages = {
    400: 'Please provide a more detailed pricing proposal.',
    422: 'Please check the information you entered.',
    502: 'The pricing memory service is temporarily unavailable.',
    503: 'The reasoning service is temporarily unavailable.',
    500: 'Something went wrong while processing your request.',
  };
  return messages[status] || defaultMessage || 'Something went wrong. Please try again.';
}

/**
 * Core fetch wrapper. Throws a structured error on non-2xx responses.
 */
async function apiFetch(path, options = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkError) {
    // Network-level failure (backend down, CORS, etc.)
    throw {
      type: 'network',
      message: 'Unable to reach the backend. Please check that the server is running.',
      original: networkError,
    };
  }

  if (!response.ok) {
    let detail = null;
    try {
      const body = await response.json();
      detail = body?.detail || body?.message || null;
    } catch {
      // ignore parse error
    }

    throw {
      type: 'api',
      status: response.status,
      message: mapErrorMessage(response.status, detail),
      detail,
    };
  }

  return response.json();
}

/**
 * POST /ask
 * Submit a pricing proposal for evidence-grounded analysis.
 *
 * @param {string} proposal — the raw proposal text
 * @returns {Promise<{
 *   response: string,
 *   has_evidence: boolean,
 *   evidence: Array<{text: string, score: number, metadata: object}>,
 *   patterns: string[],
 *   contradictions: string[],
 *   verdict: 'supported' | 'mixed' | 'no_precedent',
 *   confidence: number
 * }>}
 */
export async function askProposal(proposal) {
  return apiFetch('/ask', {
    method: 'POST',
    body: JSON.stringify({ proposal }),
  });
}

/**
 * GET /history
 * Retrieve all historical pricing decisions, newest first.
 *
 * @returns {Promise<Array<{
 *   id: string,
 *   pricing_change: string,
 *   target_segment: string,
 *   actual_effect: string,
 *   date: string
 * }>>}
 */
export async function getHistory() {
  const data = await apiFetch('/history');
  // Backend returns { decisions: [...] } — unwrap to a plain array.
  return Array.isArray(data) ? data : (data?.decisions ?? []);
}

/**
 * POST /outcome
 * Record the actual outcome of a pricing decision so future
 * analyses can learn from it.
 *
 * @param {{ proposal: string, outcome: string, revenue_impact?: string, retention_impact?: string }} data
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function submitOutcome(data) {
  return apiFetch('/outcome', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}