import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlueCollar - Blockchain Education on Stellar',
  description:
    'Learn blockchain development with verifiable on-chain credentials powered by the Stellar network.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
