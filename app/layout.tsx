import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AnalyticsProvider from "./providers/AnalyticsProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "Quiz Pós-Término | Descubra sua fase e receba orientações",
  description:
    "Descubra em que fase do pós-término você está e receba um relatório personalizado com orientações práticas para sua recuperação emocional.",
  keywords: "término, superação, relacionamento, luto amoroso, quiz emocional",
  openGraph: {
    title: "Quiz Pós-Término | Descubra sua fase",
    description:
      "Em 2 minutos, receba um resumo com orientações práticas para hoje.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <html lang="pt-BR">
      <head>
        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {/* Meta Pixel */}
        {fbPixelId && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </head>
      <body className={inter.className}>
        <AnalyticsProvider />
        <main className="min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="border-t py-8 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
            <p>
              © {new Date().getFullYear()} Quiz Pós-Término. Todos os direitos
              reservados.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/privacidade" className="hover:underline">
                Política de Privacidade
              </a>
              <a href="/termos" className="hover:underline">
                Termos de Uso
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
