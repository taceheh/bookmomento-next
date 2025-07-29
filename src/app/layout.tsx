import { Header } from '@/components/layout/header';
import './globals.css';
import { Footer } from '@/components/layout/footer';
export const dynamic = 'force-dynamic';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-[650px] min-h-screen mx-auto bg-white ">
          <Header />
          <main> {children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
