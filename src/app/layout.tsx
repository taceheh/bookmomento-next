import { Header } from '@/components/layout/header';
import './globals.css';
import { Footer } from '@/components/layout/footer';
import { getUserServer } from '@/lib/auth/server';
import AuthHydrator from '@/components/AuthHydrator';
export const dynamic = 'force-dynamic';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import QueryProvider from '@/components/providers/QueryProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '책담',
  description: '책에 대한 이야기',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserServer();
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="max-w-[650px] min-h-screen mx-auto bg-white ">
          <QueryProvider>
            <AuthHydrator initialUser={user} />
            <Header />
            <main>{children}</main>
            <Footer />
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
