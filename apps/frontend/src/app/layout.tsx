import type { Metadata } from 'next';
import './globals.css';
import { WalletButton } from '@/components/wallet/WalletButton';

export const metadata: Metadata = {
  title: 'Brain-Storm - Blockchain Education on Stellar',
  description:
    'Learn blockchain development with verifiable on-chain credentials powered by the Stellar network.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b px-6 py-3 flex items-center justify-between">
          <a href="/" className="font-bold text-lg text-blue-600">Brain-Storm</a>
          <div className="flex items-center gap-4">
            <a href="/courses" className="text-sm text-gray-600 hover:text-gray-900">Courses</a>
            <a href="/admin" className="text-sm text-gray-600 hover:text-gray-900">Admin</a>
            <WalletButton />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
