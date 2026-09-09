import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-playfair',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-lato',
})

export const metadata: Metadata = {
  title: 'Ament Home & Tech Services — CCTV Installation & AI Automation | St. Augustine, FL',
  description: 'Professional CCTV and security camera installation, AI home automation, smart home systems, and tech setup in Greater St. Augustine, FL. Installed camera packages from $2,199 — or get a custom quote scoped to your project.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <head>
        {/* Preload the first hero frame — improves LCP before JS runs */}
        <link rel="preload" as="image" href="/frames/house/frame_001.jpg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
