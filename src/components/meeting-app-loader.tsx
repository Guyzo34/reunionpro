"use client"
import dynamic from "next/dynamic"

// ssr: false doit être dans un Client Component (règle Next.js 15)
const MeetingApp = dynamic(() => import("./meeting-app"), { ssr: false })

export default function MeetingAppLoader() {
  return <MeetingApp />
}
