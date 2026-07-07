'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type StatItem = {
  value: string;
  label: string;
};

type FeatureItem = {
  title: string;
  body: string;
};

type SectionPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  stats?: StatItem[];
  featureItems?: FeatureItem[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  accentLabel?: string;
};

export default function SectionPageShell({
  eyebrow,
  title,
  description,
  highlights,
  stats = [],
  featureItems = [],
  primaryHref,
  primaryLabel,
  secondaryHref = '/',
  secondaryLabel = 'Back to home',
  accentLabel = 'Premium experience',
}: SectionPageShellProps) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <main className="page-shell">
      <nav id="navbar" aria-label="Primary navigation">
        <Link href="/" className="nav-logo" aria-label="Royal Enfield Home">
          <span className="logo-brand">Royal Enfield</span>
          <span className="logo-sub">Authorized Dealership</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/models">Models</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/finance">Finance</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <Link href="/test-ride" className="nav-cta">Book Test Ride</Link>
        <button className={`nav-hamburger ${isMenuOpen ? 'open' : ''}`} aria-label="Toggle menu" onClick={toggleMenu}>
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} id="mobile-menu">
        <Link href="/models" onClick={toggleMenu}>Models</Link>
        <Link href="/about" onClick={toggleMenu}>About</Link>
        <Link href="/services" onClick={toggleMenu}>Services</Link>
        <Link href="/test-ride" onClick={toggleMenu}>Test Ride</Link>
        <Link href="/finance" onClick={toggleMenu}>Finance</Link>
        <Link href="/contact" onClick={toggleMenu}>Contact</Link>
      </div>

      <section className="page-hero">
        <div className="page-hero-copy">
          <span className="page-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>

          <div className="page-actions">
            <Link href={primaryHref} className="btn-primary page-cta">
              <i className="fa-solid fa-motorcycle"></i> {primaryLabel}
            </Link>
            <Link href={secondaryHref} className="btn-outline page-cta">
              <i className="fa-regular fa-arrow-left"></i> {secondaryLabel}
            </Link>
          </div>

          <div className="page-highlights">
            {highlights.map((highlight) => (
              <span className="page-pill" key={highlight}>{highlight}</span>
            ))}
          </div>
        </div>

        <div className="page-hero-card">
          <div className="page-card-head">
            <span className="page-card-label">{accentLabel}</span>
            <div className="page-card-line" />
          </div>

          {stats.length > 0 && (
            <div className="page-stat-grid">
              {stats.map((stat) => (
                <div className="page-stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {featureItems.length > 0 && (
            <div className="page-card-list">
              {featureItems.map((item) => (
                <div className="page-list-item" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
