import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThreadMiner - Mine Reddit Threads",
  description: "Extract insights from Reddit threads. Get clean JSON, markdown, or AI-powered analysis from any Reddit URL.",
  keywords: ["reddit", "thread", "mining", "analysis", "json", "api"],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[var(--bg-primary)]">
        {/* Dot pattern background */}
        <div className="fixed inset-0 pattern-dots opacity-30 pointer-events-none" />
        
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
