import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zameendar.ai - Land Suitability Analysis',
  description: 'AI-powered land suitability scoring for Agriculture, Housing, Industry, and Renewables',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
