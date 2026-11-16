import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Profile Picture & Thumbnail Maker | Upwork Whales",
  description:
    "Make a ringed profile picture, portfolio thumbnail or intro-video thumbnail. Your images stay in your browser.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>): React.JSX.Element {
  return (
    <html lang="en" data-ds="nordic-calm">
      <body>{children}</body>
    </html>
  );
}
