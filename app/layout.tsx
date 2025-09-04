import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { Providers } from "./providers";

const fontSans = Space_Grotesk({
  subsets: ["latin",],
  weight:["300","400","500","600","700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Yatri Rakshak",
  description: "SIH 2025 @GGITS",
  keywords:[
    "ggits",
    "sih hackathon ggits",
    "sih hackathon jabalpur" ,
    "sih yatri rakshak",
    "smart india hackathon",
    "yatri rakshak smart india hackathon",
  ],
  openGraph: {
    // images: '/hero.jpeg',
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className="dark scheme-only-dark">
      <body
        className={`${fontSans.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
