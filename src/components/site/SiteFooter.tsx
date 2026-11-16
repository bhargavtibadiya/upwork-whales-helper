import { LogoMark } from "./SiteHeader";

export function SiteFooter(): React.JSX.Element {
  return (
    <footer className="site-footer">
      <div className="studio-container">
        <div className="footer-grid">
          <div>
            <span className="logo">
              <LogoMark />
              Upwork Helper
            </span>
            <p>
              Ringed profile pictures and clickable thumbnails for your Upwork profile. Everything
              runs in your browser.
            </p>
          </div>
          <div>
            <h2 className="footer-title">Make</h2>
            <ul className="footer-links">
              <li>
                <a href="#profile">Profile picture</a>
              </li>
              <li>
                <a href="#portfolio">Portfolio thumbnail</a>
              </li>
              <li>
                <a href="#intro">Intro video thumbnail</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="footer-title">Privacy</h2>
            <ul className="footer-links">
              <li>Images never leave your browser</li>
              <li>Nothing is uploaded or stored</li>
              <li>
                <a href="https://bhargavtibadiya.com/">Built by Bhargav Tibadiya</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Upwork Helper</span>
          <span>
            Made by <a href="https://bhargavtibadiya.com/">Bhargav Tibadiya</a>
          </span>
          <span>Free to use. PNG exports are yours.</span>
        </div>
      </div>
    </footer>
  );
}
