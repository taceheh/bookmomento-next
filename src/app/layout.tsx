import { Header } from '@/components/layout/header';
import './globals.css';
import { Footer } from '@/components/layout/footer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-[600px] min-h-screen mx-auto bg-white px-4 shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]">
          <Header />
          <main> {children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
