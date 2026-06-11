import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ReunionPro — Réunions en ligne",
  description: "Créez et rejoignez des réunions vidéo instantanément",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
