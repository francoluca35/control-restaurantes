import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../providers/AppProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Home Master Dashboard",
  description: "Dashboard para administración de restaurantes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
