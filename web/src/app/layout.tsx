import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AOSProvider } from '@/components/providers/aos-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { TopBar } from '@/components/layout/top-bar';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { DomErrorBoundary } from '@/components/providers/dom-error-boundary';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'B2B Маркетплейс - Промислове обладнання',
  description: 'Провідний B2B маркетплейс промислового обладнання. Зв\'яжіться з перевіреними постачальниками з усього світу.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <DomErrorBoundary>
                <AOSProvider>
                  <TopBar />
                  <Navbar />
                  <main className="min-h-screen pb-24 md:pb-32">{children}</main>
                  <Footer />
                </AOSProvider>
              </DomErrorBoundary>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
