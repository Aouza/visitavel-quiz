import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AnalyticsProvider from "./providers/AnalyticsProvider";
import MetaPixel from "@/components/MetaPixel";
import { ClarityAnalytics } from "@/components/Clarity";
import { ClarityConsent } from "@/components/ClarityConsent";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "Quiz Pós-Término | Descubra sua fase e receba orientações",
  description:
    "Descubra em que fase do pós-término você está e receba um relatório personalizado com orientações práticas para seu realinhamento interno.",
  keywords: "término, superação, relacionamento, luto amoroso, mapa pessoal",
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
      </head>
      <body className={inter.className}>
        <AnalyticsProvider />
        <MetaPixel />
        <ClarityAnalytics />
        <ClarityConsent />
        <Analytics />
        <SpeedInsights />
        <main className="min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="border-t py-8 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
            <p>
              © {new Date().getFullYear()} Quiz Pós-Término. Todos os direitos
              reservados.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/politica-privacidade" className="hover:underline">
                Política de Privacidade
              </a>
              <a href="/termos-uso" className="hover:underline">
                Termos de Uso
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
