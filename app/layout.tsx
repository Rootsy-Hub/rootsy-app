import type { Metadata } from 'next'
import { Inter, Nunito_Sans, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/AuthContextSupabase'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { getInitialAuthUser } from '@/lib/getInitialAuthUser'
import { ROOTSY_BRAND_TITLE } from '@/lib/rootsyBrand'
import { Toaster } from '@/components/ui/toaster'
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
  title: ROOTSY_BRAND_TITLE,
  description:
    'Sistema de gestión que se adapta a cualquier negocio. Simple en la superficie, profundo cuando lo necesitás.',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialUser = await getInitialAuthUser()

  return (
    <html lang="es" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${nunitoSans.variable} ${sourceSans.variable} ${inter.variable} font-sans antialiased`}>
        <AuthProvider initialUser={initialUser}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
