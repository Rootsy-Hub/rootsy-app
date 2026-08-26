import type { Metadata, Viewport } from 'next'
import { Inter, Nunito_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/AuthContextSupabase'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { getInitialAuthUser } from '@/lib/getInitialAuthUser'
import { ROOTSY_BRAND_TITLE } from '@/lib/rootsyBrand'
import { RootsyToaster } from '@/components/rootsy-toast'
import './globals.css'

/** Chrome del producto y números: títulos, botones, labels, montos. */
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
/** Prosa: handbook, ayuda, bloques largos. */
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: '--font-nunito-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

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
    <html
      lang="es"
      className={`${inter.variable} ${nunitoSans.variable} dark scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <AuthProvider initialUser={initialUser}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
        <RootsyToaster />
        <Analytics />
      </body>
    </html>
  )
}
