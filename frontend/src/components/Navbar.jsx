import { useState } from 'react';
import { Menu, CircleX } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Analyze', href: '#analyze' },
  { label: 'History', href: '#history' },
  { label: 'Outcomes', href: '#outcomes' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  function handleLinkClick() {
    setIsOpen(false);
  }

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar__inner">
        <a href="#top" className="navbar__brand" aria-label="Pricing Consequence Agent — home">
          Pricing Consequence Agent
        </a>

        {/* Desktop links */}
        <ul
          className={`navbar__links${isOpen ? ' is-open' : ''}`}
          role="list"
          id="nav-menu"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a href={href} onClick={handleLinkClick}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="navbar__toggle"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="nav-menu"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isOpen ? <CircleX size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}
