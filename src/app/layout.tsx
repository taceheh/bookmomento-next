import { Header } from '@/components/layout/header';
import './globals.css';
import { Footer } from '@/components/layout/footer';
import { getUserServer } from '@/lib/auth/server';
import AuthHydrator from '@/components/AuthHydrator';
export const dynamic = 'force-dynamic';
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserServer();
  return (
    <html lang="en">
      <body>
        <div className="max-w-[650px] min-h-screen mx-auto bg-white ">
          <AuthHydrator initialUser={user} />
          <Header />
          <main> {children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
