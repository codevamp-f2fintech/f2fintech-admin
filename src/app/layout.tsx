import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ReduxProvider from '@/redux/provider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {

  title: "F2-Fintech Admin Panel",

  description: "Resolving tickets of customers",

};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode; }>) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}

export default RootLayout;
