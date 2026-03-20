import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ament Home & Tech Services — St. Augustine, FL',
  description: 'Expert smart home installation, AV, and security services in Greater St. Augustine, FL. TV mounting, automation, cameras, mesh Wi-Fi, and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect eliminates ~100ms DNS+TCP handshake before font CSS request */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Removed unused Playfair weight 500 — saves one font file download */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
