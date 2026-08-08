import type { Metadata } from 'next'
import { Inter, Nunito_Sans, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/AuthContextSupabase'
import { QueryProvider } from '@/components/providers/QueryProvider'
import './globals.css'

// Fuente principal del proyecto
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: '--font-nunito-sans',
  weight: ['400', '500', '600', '700', '800', '900']
});
// Fuente secundaria del proyecto
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: '--font-source-sans',
  weight: ['400', '500', '600', '700']
});
/** Importes, totales y columnas numéricas */
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Rootsy — El mundo dentro de tu negocio',
  description:
    'Sistema de gestión que se adapta a cualquier negocio. Simple en la superficie, profundo cuando lo necesitás.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${nunitoSans.variable} ${sourceSans.variable} ${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
