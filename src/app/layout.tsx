import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ReduxProvider from "@/redux/provider";
import { RootLayoutContent } from "./RootLayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "F2-Fintech Admin Panel",
  description: "Resolving tickets of customers",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ReduxProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </ReduxProvider>
      </body>
    </html>
  );
};

export default RootLayout;
