import { useRef, useState } from 'react';
import { Paperclip, CircleX, FileText, TriangleAlert } from 'lucide-react';

const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'text/plain': 'TXT',
};

const ACCEPT_ATTR = Object.keys(ACCEPTED_TYPES).join(',') + ',.pdf,.docx,.doc,.txt';

const MAX_CHARS = 2000;

/**
 * FileUpload — PDF / DOCX / TXT upload with browser-side text extraction.
 *
 * On successful extraction the trimmed text (capped at MAX_CHARS) is passed
 * to onExtracted(text). The parent sets it as the proposal value.
 *
 * Props:
 *   onExtracted  — (text: string) => void
 *   disabled     — boolean
 */
export default function FileUpload({ onExtracted, disabled }) {
  const inputRef = useRef(null);
  const [fileName, setFileName]     = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);

  async function handleFile(file) {
    if (!file) return;

    setExtractError(null);
    setFileName(file.name);
    setIsExtracting(true);

    try {
      const text = await extractText(file);
      const trimmed = text.trim().slice(0, MAX_CHARS);
      if (!trimmed) {
        throw new Error('No readable text found in this file.');
      }
      onExtracted(trimmed);
    } catch (err) {
      setExtractError(err.message || "We couldn't extract text from this file.");
      setFileName(null);
    } finally {
      setIsExtracting(false);
    }
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    setFileName(null);
    setExtractError(null);
    onExtracted('');
  }

  // ---- render -------------------------------------------------
  if (fileName || isExtracting) {
    return (
      <div className="file-upload__result">
        <FileText size={15} className="file-upload__result-icon" aria-hidden="true" />
        <span className="file-upload__result-name">
          {isExtracting ? 'Extracting text…' : `✓  ${fileName}`}
        </span>
        {!isExtracting && (
          <button
            type="button"
            className="file-upload__remove"
            onClick={handleRemove}
            aria-label="Remove uploaded file"
          >
            <CircleX size={14} aria-hidden="true" />
            Remove
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`file-upload__zone${disabled ? ' file-upload__zone--disabled' : ''}`}
        onDrop={disabled ? undefined : handleDrop}
        onDragOver={(e) => e.preventDefault()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload a proposal file (PDF, DOCX, or TXT)"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); } }}
      >
        <Paperclip size={15} aria-hidden="true" className="file-upload__zone-icon" />
        <span>Upload Proposal</span>
        <span className="file-upload__zone-hint">PDF, DOCX, TXT</span>
      </div>

      {extractError && (
        <div className="file-upload__error" role="alert">
          <TriangleAlert size={13} aria-hidden="true" />
          {extractError}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

// ---- Text extraction ----------------------------------------

async function extractText(file) {
  const mime = file.type;

  // Plain text — just read as text
  if (mime === 'text/plain' || file.name.endsWith('.txt')) {
    return readAsText(file);
  }

  // DOCX — use mammoth
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    return extractFromDocx(file);
  }

  // PDF — use pdfjs-dist
  if (mime === 'application/pdf' || file.name.endsWith('.pdf')) {
    return extractFromPdf(file);
  }

  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result || '');
    reader.onerror = ()  => reject(new Error('Could not read the file.'));
    reader.readAsText(file);
  });
}

async function extractFromDocx(file) {
  const mammoth = (await import('mammoth')).default;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

async function extractFromPdf(file) {
  // Dynamic import keeps the large pdfjs bundle out of the main chunk
  const pdfjsLib = await import('pdfjs-dist');

  // Point the worker at the same version we installed, served from node_modules
  // Vite will copy assets — use the CDN fallback for the hackathon demo
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(' '));
  }

  return pages.join('\n');
}
