import type { Metadata } from "next";
import { applicationSchema, existingDescription, existingTitle, siteUrl } from "@/lib/seo";
import "./globals.css";
import "./theme.css";
import "./studio.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
  title: existingTitle,
  description: existingDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Upwork Helper",
    title: existingTitle,
    description: existingDescription,
    images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: existingTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: existingTitle,
    description: existingDescription,
    images: ["/social-preview.png"],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>): React.JSX.Element {
  return (
    <html lang="en" data-ds="nordic-calm" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* [WHY] Runs before paint so a saved light choice never flashes dark. Dark is the default. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static theme bootstrap, no user input
          dangerouslySetInnerHTML={{
            __html:
              'try{document.documentElement.dataset.theme=localStorage.getItem("theme")==="light"?"light":"dark"}catch(e){}',
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static application metadata, no user input
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(applicationSchema).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        {/* Analytics is installed but collection is paused until the hosting plan is confirmed. */}
      </body>
    </html>
  );
}
