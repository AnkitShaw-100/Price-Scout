import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Price Scout",
  description: "A App which tracks price of given item",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
      <Toaster richColors />
    </html>
  );
}
