import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../providers/AppProvider";
import { QueryProvider } from "../providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Home Master Dashboard",
  description: "Dashboard para administración de restaurantes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
