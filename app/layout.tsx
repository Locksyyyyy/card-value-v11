import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CardValue UK — Pokémon Card Scanner',
  description: 'Scan a Pokémon card and estimate its UK market value.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
