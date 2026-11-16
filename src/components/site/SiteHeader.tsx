import { ThemeToggle } from "./ThemeToggle";

export function LogoMark(): React.JSX.Element {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="3.5" width="15" height="12" rx="2.5" fill="none" strokeWidth="1.8" />
        <circle cx="6.8" cy="7.3" r="1.3" stroke="none" />
        <path
          d="m3 13.2 3.6-3.2 3 2.6 3.2-3.6 4.2 4.2"
          fill="none"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M14.6 13.4l7.4 2.6-3 1-1.7 3.1z" stroke="none" />
      </svg>
    </span>
  );
}

export function SiteHeader(): React.JSX.Element {
  return (
    <header className="site-header">
      <div className="studio-container">
        <a className="logo" href="#top">
          <LogoMark />
          <span className="logo-text">
            Upwork Thumbnail Maker
            <span className="logo-byline">by Bhargav Tibadiya</span>
          </span>
        </a>
        <nav className="header-nav" aria-label="Main">
          <a className="header-link" href="#profile">
            Profile picture
          </a>
          <a className="header-link" href="#portfolio">
            Portfolio
          </a>
          <a className="header-link" href="#intro">
            Intro video
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
