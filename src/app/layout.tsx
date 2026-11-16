import type { Metadata } from "next";
import { Anton, Montserrat, Space_Grotesk, Work_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });
// [WHY] Anton and Montserrat are canvas artwork fonts; they must load in the
// page so canvas text and PNG exports render with the right faces.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "Upwork Whales Helper",
  description: "Browser-local image editor for Upwork profile pictures, portfolio thumbnails and intro-video thumbnails.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-ds="risograph-print">
      <body className={`${spaceGrotesk.variable} ${workSans.variable} ${anton.variable} ${montserrat.variable}`}>
        {children}
      </body>
    </html>
  );
}
