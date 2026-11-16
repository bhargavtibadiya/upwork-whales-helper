import { ThemeToggle } from "./ThemeToggle";

export function LogoMark(): React.JSX.Element {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="7" width="18" height="14" rx="3" fill="none" strokeWidth="1.8" />
        <path
          d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v3h4v-3"
          fill="none"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
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
            Upwork Helper
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
