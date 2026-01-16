import './globals.css'

export const metadata = {
  title: 'Meme Sniper',
  description: 'AI-Powered Memecoin Hunter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-black text-white">{children}</body>
    </html>
  )
}
