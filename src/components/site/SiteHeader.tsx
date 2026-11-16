import { ThemeToggle } from "./ThemeToggle";

export function LogoMark(): React.JSX.Element {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 13c3 0 4-3 6-3s3 3 6 3 4-4 6-6c0 6-3 11-9 11-5 0-9-2-9-5z" />
        <circle cx="16" cy="12" r="0.8" />
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
          Thumbnail Studio
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
