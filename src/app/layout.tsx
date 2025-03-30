import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./i18n/i18nContext";
import enLocale from "./i18n/locales/en.json";
import ptLocale from "./i18n/locales/pt.json";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#6441a5"
};

type Locale = 'en' | 'pt';
const resources = {
  en: enLocale,
  pt: ptLocale
};

export async function generateMetadata(): Promise<Metadata> {
  const defaultLocale = 'en';
  const translations = resources[defaultLocale];
  
  return {
    title: translations.metadata.title,
    description: translations.metadata.description,
    keywords: translations.metadata.keywords,
    authors: [{ name: "Júlia Klee" }],
    metadataBase: new URL("https://emoto.juliaklee.wtf"),
    openGraph: {
      type: "website",
      url: "https://emoto.juliaklee.wtf/",
      title: translations.metadata.title,
      description: translations.metadata.description,
      images: ["/img/Emoto-Background.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: translations.metadata.title,
      description: translations.metadata.description,
      images: ["/img/Emoto-Background.png"],
    },
    alternates: {
      languages: {
        'en': '/en',
        'pt': '/pt'
      }
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" type="image/webp" href="/img/favicon.png" />
        <link rel="apple-touch-icon" href="/img/favicon.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
        <script defer data-domain="emoto.juliaklee.wtf" src="https://plausible.io/js/script.revenue.js"></script>
      </head>
      <body className={inter.className}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
