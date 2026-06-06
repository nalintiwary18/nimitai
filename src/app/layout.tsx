import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sales Signal Analyzer | AI Meeting Transcript Coach",
  description: "Analyze call transcripts to detect buying interest, objections, or confusion with immediate actionable coaching tips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
