import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fontSans = Space_Grotesk({
  subsets: ["latin",],
  weight:["300","400","500","600","700"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scheme-only-dark">
      <body
        className={`${fontSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
