import "./globals.css";

export const metadata = {
  title: "Price Scout",
  description: "A App which tracks price of given item",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
