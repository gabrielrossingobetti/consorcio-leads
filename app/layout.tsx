import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Display — geométrica e ousada, diferencia do padrão do setor financeiro
const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

// Body — legível, moderna, não compete com a display
const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

// Números financeiros — precisão e confiança em valores
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.consorciolidera.com.br"),
  title: "Consórcio Lidera | Planeje seu próximo carro ou imóvel",
  description: "Consórcio para uma compra planejada. Conte seu objetivo, orçamento e momento de compra para receber orientação sem compromisso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true" ||
    (process.env.VERCEL_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false");

  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {analyticsEnabled && <>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-1826905772"
          strategy="afterInteractive"
        />
        <Script id="google-tags" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4EJBKTY48M');
            gtag('config', 'AW-1826905772');
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wyquou728a");
          `}
        </Script>
        </>}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
