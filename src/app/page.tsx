import dynamic from "next/dynamic"

// SSR désactivé : DailyIframe accède à window/document
const MeetingApp = dynamic(() => import("../components/meeting-app"), { ssr: false })

export default function Page() {
  return <MeetingApp />
}
