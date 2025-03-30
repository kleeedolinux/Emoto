import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./i18n/i18nContext";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#6441a5"
};

export const metadata: Metadata = {
  title: "Emoto - Twitch Emote Guessing Game",
  description: "Emoto - Jogo de adivinhação de emotes da Twitch. Teste seu conhecimento de emotes de seus streamers favoritos!",
  keywords: "Twitch, emotes, game, emote guessing, BTTV, 7TV, Twitch emotes, streaming",
  authors: [{ name: "Júlia Klee" }],
  metadataBase: new URL("https://emoto.juliaklee.wtf"),
  openGraph: {
    type: "website",
    url: "https://emoto.juliaklee.wtf/",
    title: "Emoto - Twitch Emote Guessing Game",
    description: "Teste seu conhecimento de emotes da Twitch neste divertido jogo de adivinhação!",
    images: ["/img/Emoto-Background.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emoto - Twitch Emote Guessing Game",
    description: "Teste seu conhecimento de emotes da Twitch neste divertido jogo de adivinhação!",
    images: ["/img/Emoto-Background.png"],
  },
};

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
